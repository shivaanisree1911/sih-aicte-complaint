import path from 'path';
import fs from 'fs';
import { Complaint } from '../models/Complaint.js';
import { Institution } from '../models/Institution.js';
import { CaseHistory } from '../models/CaseHistory.js';
import { Overlap } from '../models/Overlap.js';
import { Notification } from '../models/Notification.js';
import { Document } from '../models/Document.js';
import { User } from '../models/User.js';
import { ACTION_TYPES, ROLES } from '../config/roles.js';
import { getNextCaseId } from '../services/sequenceService.js';
import { detectOverlapsForInstitution } from '../services/overlapEngine.js';
import { logAuditEvent } from '../middleware/auditLogger.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import { sendOtp, verifyOtp, isEmailVerified } from '../services/verificationService.js';

export async function getComplaints(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const {
      search,
      status,
      priority,
      bureau,
      category,
      institutionId,
      isOverdue,
      startDate,
      endDate,
      sortBy = 'receivedAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    const andConditions = [];

    // STRICT ROLE-BASED ACCESS CONTROL (RBAC) RULES:
    // 1. Students and Faculty: Can ONLY view complaints they themselves submitted
    if (req.user.role === ROLES.STUDENT || req.user.role === ROLES.FACULTY) {
      andConditions.push({
        $or: [
          { createdBy: req.user._id },
          { complainantEmail: req.user.email.toLowerCase() }
        ]
      });
    }
    // 2. College Principal: Can ONLY view complaints filed for their own institution (from both students and teachers)
    else if (req.user.role === ROLES.PRINCIPAL) {
      if (req.user.institutionId) {
        query.institutionId = req.user.institutionId;
      } else if (req.user.institutionName) {
        query.institutionName = new RegExp(req.user.institutionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      }
    }
    // 3. Regional Officer: Filter by geographical region
    else if (req.user.role === ROLES.REGIONAL_OFFICER && req.user.region !== 'All') {
      const regionalInstitutions = await Institution.find({ region: req.user.region }).select('_id');
      query.institutionId = { $in: regionalInstitutions.map(i => i._id) };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (bureau && bureau !== 'All') {
      query.assignedBureau = bureau;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (req.query.complainantType && req.query.complainantType !== 'All') {
      query.complainantType = req.query.complainantType;
    }

    if (institutionId && req.user.role !== ROLES.PRINCIPAL) {
      query.institutionId = institutionId;
    }

    if (isOverdue === 'true') {
      query.expectedDisposalDate = { $lt: new Date() };
      query.status = { $nin: ['Disposed', 'Closed'] };
    }

    if (startDate || endDate) {
      query.receivedAt = {};
      if (startDate) query.receivedAt.$gte = new Date(startDate);
      if (endDate) query.receivedAt.$lte = new Date(endDate);
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      andConditions.push({
        $or: [
          { caseId: regex },
          { subject: regex },
          { institutionName: regex },
          { aictePermanentId: regex },
          { assignedOfficerName: regex },
          { complainantName: regex },
          { complainantEmail: regex }
        ]
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('assignedOfficer', 'name email role')
        .lean(),
      Complaint.countDocuments(query)
    ]);

    return sendPaginated(res, 'Complaints retrieved successfully.', complaints, {
      total,
      page,
      limit
    });
  } catch (err) {
    next(err);
  }
}

export async function getComplaintById(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('institutionId')
      .populate('assignedOfficer', 'name email role bureau')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role');

    if (!complaint) {
      return sendError(res, 'Complaint record not found.', 404);
    }

    // Role-based authorization rules:
    // 1. Student / Faculty can ONLY inspect their own complaint
    if (req.user.role === ROLES.STUDENT || req.user.role === ROLES.FACULTY) {
      const isOwner = complaint.createdBy && String(complaint.createdBy._id || complaint.createdBy) === String(req.user._id);
      const isEmailMatch = complaint.complainantEmail && complaint.complainantEmail.toLowerCase() === req.user.email.toLowerCase();
      if (!isOwner && !isEmailMatch) {
        return sendError(res, 'Access denied. You can only view your own complaints.', 403);
      }
    }

    // 2. Principal can ONLY inspect complaints for their own college
    if (req.user.role === ROLES.PRINCIPAL) {
      const matchesInstId = req.user.institutionId && String(complaint.institutionId?._id || complaint.institutionId) === String(req.user.institutionId);
      const matchesInstName = req.user.institutionName && complaint.institutionName && complaint.institutionName.toLowerCase().includes(req.user.institutionName.toLowerCase());
      if (!matchesInstId && !matchesInstName) {
        return sendError(res, 'Access denied. Principals can only view complaints filed for their own college.', 403);
      }
    }

    // Retrieve full chronological timeline history
    const history = await CaseHistory.find({ complaintId: complaint._id })
      .sort({ createdAt: 1 });

    // Retrieve active overlaps involving this case
    const overlaps = await Overlap.find({
      complaintIds: complaint._id,
      reviewStatus: { $ne: 'Dismissed as Not Related' }
    });

    return sendSuccess(res, 'Complaint details retrieved.', {
      complaint,
      history,
      overlaps
    });
  } catch (err) {
    next(err);
  }
}

export async function createComplaint(req, res, next) {
  try {
    const {
      institutionId,
      category,
      subject,
      description,
      priority = 'Medium',
      assignedBureau,
      assignedOfficer,
      expectedDisposalDate,
      relatedCases,
      complainantType = 'Student',
      complainantName,
      complainantEmail,
      complainantPhone,
      complainantIdNumber,
      department,
      emailVerified = true
    } = req.body;

    const targetInstitutionId = institutionId || req.user.institutionId;
    const targetBureau = assignedBureau || (category === 'Academic Issues' ? 'Regulation Bureau (RB)' : 'Public Grievance Redressal Cell (PGRC)');

    if (!targetInstitutionId || !category || !subject || !description) {
      return sendError(res, 'Please provide institution, category, subject, and description.', 400);
    }

    const institution = await Institution.findById(targetInstitutionId);
    if (!institution) {
      return sendError(res, 'Specified institution does not exist.', 404);
    }

    // Atomically generate safe case ID
    const caseId = await getNextCaseId();

    // Default expected disposal date: 30 days from now if not specified
    const disposalDate = expectedDisposalDate
      ? new Date(expectedDisposalDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    let officerName = 'Unassigned';
    if (assignedOfficer) {
      const officer = await User.findById(assignedOfficer);
      if (officer) officerName = officer.name;
    }

    const finalComplainantType = req.user.role === ROLES.FACULTY ? 'Faculty' : (req.user.role === ROLES.STUDENT ? 'Student' : (complainantType || 'Student'));
    const finalComplainantName = complainantName ? complainantName.trim() : req.user.name;
    const finalComplainantEmail = complainantEmail ? complainantEmail.trim().toLowerCase() : req.user.email;
    const finalComplainantId = complainantIdNumber ? complainantIdNumber.trim() : (req.user.rollOrEmployeeId || '');

    const complaint = await Complaint.create({
      caseId,
      institutionId: institution._id,
      institutionName: institution.name,
      aictePermanentId: institution.aictePermanentId,
      category,
      subject: subject.trim(),
      description: description.trim(),
      priority,
      status: 'Received',
      assignedBureau: targetBureau,
      assignedOfficer: assignedOfficer || null,
      assignedOfficerName: officerName,
      expectedDisposalDate: disposalDate,
      relatedCases: Array.isArray(relatedCases) ? relatedCases : [],
      complainantType: finalComplainantType,
      complainantName: finalComplainantName,
      complainantEmail: finalComplainantEmail,
      complainantPhone: complainantPhone ? complainantPhone.trim() : '',
      complainantIdNumber: finalComplainantId,
      department: department ? department.trim() : (req.user.department || 'General'),
      emailVerified: true,
      emailVerifiedAt: new Date(),
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    // Record initial CaseHistory entry
    await CaseHistory.create({
      complaintId: complaint._id,
      caseId: complaint.caseId,
      actionType: ACTION_TYPES.CREATED,
      previousStatus: null,
      newStatus: 'Received',
      previousBureau: null,
      newBureau: assignedBureau,
      officerId: req.user._id,
      officerDisplayName: req.user.name,
      remarks: `Complaint registered by ${req.user.name} and initially routed to ${assignedBureau}.`
    });

    // Audit Log
    await logAuditEvent({
      actor: req.user,
      action: 'CREATE_COMPLAINT',
      resourceType: 'Complaint',
      resourceId: complaint._id,
      metadata: { caseId: complaint.caseId, institution: institution.name, bureau: assignedBureau },
      ipAddress: req.ip
    });

    // Run Overlap Detection Engine
    const detectedOverlaps = await detectOverlapsForInstitution(institution._id, complaint.caseId);

    return sendSuccess(res, 'Complaint created successfully.', {
      complaint,
      detectedOverlapsCount: detectedOverlaps.length
    }, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateComplaint(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 'Complaint record not found.', 404);
    }

    // Role-based authorization rules:
    // 1. Student / Faculty can ONLY inspect their own complaint
    if (req.user.role === ROLES.STUDENT || req.user.role === ROLES.FACULTY) {
      const isOwner = complaint.createdBy && String(complaint.createdBy._id || complaint.createdBy) === String(req.user._id);
      const isEmailMatch = complaint.complainantEmail && complaint.complainantEmail.toLowerCase() === req.user.email.toLowerCase();
      if (!isOwner && !isEmailMatch) {
        return sendError(res, 'Access denied. You can only view your own complaints.', 403);
      }
    }

    // 2. Principal can ONLY inspect complaints for their own college
    if (req.user.role === ROLES.PRINCIPAL) {
      const matchesInstId = req.user.institutionId && String(complaint.institutionId?._id || complaint.institutionId) === String(req.user.institutionId);
      const matchesInstName = req.user.institutionName && complaint.institutionName && complaint.institutionName.toLowerCase().includes(req.user.institutionName.toLowerCase());
      if (!matchesInstId && !matchesInstName) {
        return sendError(res, 'Access denied. Principals can only view complaints filed for their own college.', 403);
      }
    }

    const updatable = ['subject', 'description', 'priority', 'category', 'expectedDisposalDate', 'nextAction'];
    updatable.forEach(field => {
      if (req.body[field] !== undefined) {
        complaint[field] = req.body[field];
      }
    });

    complaint.updatedBy = req.user._id;
    complaint.dateOfLastAction = new Date();
    await complaint.save();

    await logAuditEvent({
      actor: req.user,
      action: 'UPDATE_COMPLAINT',
      resourceType: 'Complaint',
      resourceId: complaint._id,
      metadata: { caseId: complaint.caseId, changes: req.body },
      ipAddress: req.ip
    });

    return sendSuccess(res, 'Complaint updated successfully.', { complaint });
  } catch (err) {
    next(err);
  }
}

export async function assignComplaint(req, res, next) {
  try {
    const { officerId, remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 'Complaint not found.', 404);
    }

    let officerName = 'Unassigned';
    let officer = null;
    if (officerId) {
      officer = await User.findById(officerId);
      if (!officer) {
        return sendError(res, 'Assigned officer not found.', 404);
      }
      officerName = officer.name;
    }

    const previousOfficerName = complaint.assignedOfficerName;
    complaint.assignedOfficer = officerId || null;
    complaint.assignedOfficerName = officerName;
    complaint.updatedBy = req.user._id;
    complaint.dateOfLastAction = new Date();
    await complaint.save();

    // History Entry
    await CaseHistory.create({
      complaintId: complaint._id,
      caseId: complaint.caseId,
      actionType: ACTION_TYPES.ASSIGNED,
      previousStatus: complaint.status,
      newStatus: complaint.status,
      officerId: req.user._id,
      officerDisplayName: req.user.name,
      remarks: remarks || `Case reassigned from [${previousOfficerName}] to [${officerName}].`
    });

    // Notify assigned officer
    if (officer) {
      await Notification.create({
        recipientId: officer._id,
        type: 'CASE_ASSIGNED',
        title: `Case Assigned: ${complaint.caseId}`,
        message: `You have been assigned to case ${complaint.caseId} (${complaint.institutionName}) by ${req.user.name}.`,
        complaintId: complaint._id,
        caseId: complaint.caseId
      });
    }

    await logAuditEvent({
      actor: req.user,
      action: 'ASSIGN_COMPLAINT',
      resourceType: 'Complaint',
      resourceId: complaint._id,
      metadata: { caseId: complaint.caseId, assignedTo: officerName },
      ipAddress: req.ip
    });

    return sendSuccess(res, 'Complaint assigned successfully.', { complaint });
  } catch (err) {
    next(err);
  }
}

export async function transferComplaint(req, res, next) {
  try {
    const { newBureau, remarks } = req.body;
    if (!newBureau) {
      return sendError(res, 'New Bureau is required for transfer.', 400);
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 'Complaint not found.', 404);
    }

    const previousBureau = complaint.assignedBureau;
    const previousStatus = complaint.status;

    complaint.assignedBureau = newBureau;
    complaint.status = 'Transferred';
    complaint.assignedOfficer = null;
    complaint.assignedOfficerName = 'Unassigned';
    complaint.updatedBy = req.user._id;
    complaint.dateOfLastAction = new Date();
    complaint.nextAction = `Pending scrutiny by ${newBureau}`;
    await complaint.save();

    // History Entry
    await CaseHistory.create({
      complaintId: complaint._id,
      caseId: complaint.caseId,
      actionType: ACTION_TYPES.TRANSFERRED,
      previousStatus,
      newStatus: 'Transferred',
      previousBureau,
      newBureau,
      officerId: req.user._id,
      officerDisplayName: req.user.name,
      remarks: remarks || `Complaint transferred from [${previousBureau}] to [${newBureau}].`
    });

    // Run overlap detection as bureau reassignment can create new cross-bureau overlaps
    await detectOverlapsForInstitution(complaint.institutionId, complaint.caseId);

    // Audit Log
    await logAuditEvent({
      actor: req.user,
      action: 'TRANSFER_COMPLAINT',
      resourceType: 'Complaint',
      resourceId: complaint._id,
      metadata: { caseId: complaint.caseId, from: previousBureau, to: newBureau },
      ipAddress: req.ip
    });

    return sendSuccess(res, 'Complaint transferred successfully.', { complaint });
  } catch (err) {
    next(err);
  }
}

export async function updateComplaintStatus(req, res, next) {
  try {
    const { status, remarks } = req.body;
    if (!status) {
      return sendError(res, 'Status is required.', 400);
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 'Complaint not found.', 404);
    }

    const previousStatus = complaint.status;
    complaint.status = status;
    complaint.updatedBy = req.user._id;
    complaint.dateOfLastAction = new Date();

    if (['Disposed', 'Closed'].includes(status)) {
      complaint.disposedAt = new Date();
    } else {
      complaint.disposedAt = null;
    }

    await complaint.save();

    // History Entry
    const isDisposal = ['Disposed', 'Closed'].includes(status);
    await CaseHistory.create({
      complaintId: complaint._id,
      caseId: complaint.caseId,
      actionType: isDisposal ? ACTION_TYPES.DISPOSED : ACTION_TYPES.STATUS_CHANGE,
      previousStatus,
      newStatus: status,
      officerId: req.user._id,
      officerDisplayName: req.user.name,
      remarks: remarks || `Status transitioned from [${previousStatus}] to [${status}].`
    });

    // If disposed or closed, check if any active overlaps should be updated
    if (isDisposal) {
      await Overlap.updateMany(
        { complaintIds: complaint._id, reviewStatus: 'Coordination Required' },
        { reviewStatus: 'Resolved', resolvedAt: new Date() }
      );
    }

    await logAuditEvent({
      actor: req.user,
      action: 'UPDATE_COMPLAINT_STATUS',
      resourceType: 'Complaint',
      resourceId: complaint._id,
      metadata: { caseId: complaint.caseId, fromStatus: previousStatus, toStatus: status },
      ipAddress: req.ip
    });

    return sendSuccess(res, 'Complaint status updated.', { complaint });
  } catch (err) {
    next(err);
  }
}

export async function escalateComplaint(req, res, next) {
  try {
    const { remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 'Complaint not found.', 404);
    }

    const previousStatus = complaint.status;
    complaint.status = 'Escalated';
    complaint.priority = 'Critical';
    complaint.updatedBy = req.user._id;
    complaint.dateOfLastAction = new Date();
    complaint.nextAction = 'Senior Management Immediate Review';
    await complaint.save();

    await CaseHistory.create({
      complaintId: complaint._id,
      caseId: complaint.caseId,
      actionType: ACTION_TYPES.ESCALATED,
      previousStatus,
      newStatus: 'Escalated',
      officerId: req.user._id,
      officerDisplayName: req.user.name,
      remarks: remarks || 'Case escalated to Senior Management due to high severity/delay.'
    });

    // Alert Senior Management
    const managers = await User.find({
      role: { $in: [ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT] },
      isActive: true
    }).select('_id');

    const alerts = managers.map(m => ({
      recipientId: m._id,
      type: 'CASE_ESCALATED',
      title: `Escalated Case: ${complaint.caseId}`,
      message: `Case ${complaint.caseId} for "${complaint.institutionName}" was escalated by ${req.user.name}.`,
      complaintId: complaint._id,
      caseId: complaint.caseId
    }));

    if (alerts.length > 0) {
      await Notification.insertMany(alerts);
    }

    await logAuditEvent({
      actor: req.user,
      action: 'ESCALATE_COMPLAINT',
      resourceType: 'Complaint',
      resourceId: complaint._id,
      metadata: { caseId: complaint.caseId },
      ipAddress: req.ip
    });

    return sendSuccess(res, 'Complaint escalated to Senior Management.', { complaint });
  } catch (err) {
    next(err);
  }
}

export async function addRemark(req, res, next) {
  try {
    const { remarks } = req.body;
    if (!remarks || !remarks.trim()) {
      return sendError(res, 'Remarks text is required.', 400);
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 'Complaint not found.', 404);
    }

    complaint.dateOfLastAction = new Date();
    await complaint.save();

    const historyEntry = await CaseHistory.create({
      complaintId: complaint._id,
      caseId: complaint.caseId,
      actionType: ACTION_TYPES.REMARK_ADDED,
      previousStatus: complaint.status,
      newStatus: complaint.status,
      officerId: req.user._id,
      officerDisplayName: req.user.name,
      remarks: remarks.trim()
    });

    return sendSuccess(res, 'Remark added to case timeline.', { historyEntry });
  } catch (err) {
    next(err);
  }
}

export async function getComplaintHistory(req, res, next) {
  try {
    const history = await CaseHistory.find({ complaintId: req.params.id })
      .sort({ createdAt: 1 });

    return sendSuccess(res, 'Chronological history retrieved.', { history });
  } catch (err) {
    next(err);
  }
}

export async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded.', 400);
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 'Complaint not found.', 404);
    }

    const docRecord = await Document.create({
      complaintId: complaint._id,
      caseId: complaint.caseId,
      originalName: req.file.originalname,
      storageKey: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id
    });

    complaint.documents.push({
      documentId: docRecord._id,
      originalName: req.file.originalname,
      storageKey: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date()
    });
    await complaint.save();

    await CaseHistory.create({
      complaintId: complaint._id,
      caseId: complaint.caseId,
      actionType: ACTION_TYPES.DOCUMENT_UPLOADED,
      previousStatus: complaint.status,
      newStatus: complaint.status,
      officerId: req.user._id,
      officerDisplayName: req.user.name,
      remarks: `Uploaded supporting document: "${req.file.originalname}" (${(req.file.size / 1024).toFixed(1)} KB).`,
      documentReferences: [req.file.originalname]
    });

    return sendSuccess(res, 'Document uploaded successfully.', { document: docRecord }, 201);
  } catch (err) {
    next(err);
  }
}

export async function downloadDocument(req, res, next) {
  try {
    const { id, docId } = req.params;
    const docRecord = await Document.findOne({ _id: docId, complaintId: id });
    if (!docRecord) {
      return sendError(res, 'Document not found or unauthorized access.', 404);
    }

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.resolve(uploadDir, docRecord.storageKey);

    if (!fs.existsSync(filePath)) {
      return sendError(res, 'File not found on storage disk.', 404);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${docRecord.originalName}"`);
    res.setHeader('Content-Type', docRecord.mimeType);
    return res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
}

/**
 * Public endpoint to request a 6-digit OTP for email verification
 */
export async function sendPublicOtp(req, res, next) {
  try {
    const { email, role = 'Student', name = '' } = req.body;
    if (!email || !email.includes('@')) {
      return sendError(res, 'Please provide a valid institutional or personal email address.', 400);
    }

    const result = sendOtp(email, role, name);
    return sendSuccess(res, result.message, {
      email: email.trim().toLowerCase(),
      otpPreview: result.otpPreview,
      expiresAt: result.expiresAt
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Public endpoint to verify a submitted 6-digit OTP
 */
export async function verifyPublicOtp(req, res, next) {
  try {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) {
      return sendError(res, 'Please provide both your email address and 6-digit OTP code.', 400);
    }

    const valid = verifyOtp(email, otpCode);
    if (!valid) {
      return sendError(res, 'Invalid or expired OTP code. Please check your verification code and try again.', 400);
    }

    return sendSuccess(res, 'Email address verified successfully. You may now lodge your grievance.', {
      email: email.trim().toLowerCase(),
      verified: true
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Public endpoint for Students and Teachers to lodge a complaint
 */
export async function submitPublicComplaint(req, res, next) {
  try {
    const {
      complainantType = 'Student',
      complainantName,
      complainantEmail,
      complainantPhone,
      complainantIdNumber,
      department,
      institutionId,
      category,
      priority = 'Medium',
      subject,
      description,
      otpCode
    } = req.body;

    if (!complainantName || !complainantEmail || !institutionId || !category || !subject || !description) {
      return sendError(res, 'Please fill in all mandatory grievance details.', 400);
    }

    // Check if email OTP is verified
    const isVerified = (otpCode && verifyOtp(complainantEmail, otpCode)) || isEmailVerified(complainantEmail);
    if (!isVerified) {
      return sendError(res, 'Email verification required. Please verify your email with the 6-digit code prior to submission.', 400);
    }

    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return sendError(res, 'Selected institution was not found in the AICTE registry.', 404);
    }

    // Smart bureau allocation based on complaint category & role
    let assignedBureau = 'Public Grievance Redressal Cell (PGRC)';
    if (category === 'Academic Issues' || category === 'Approval and Accreditation' || category === 'Regulatory Compliance') {
      assignedBureau = 'Regulation Bureau (RB)';
    } else if (category === 'Admission and Fee Issues' || category === 'Finance Bureau') {
      assignedBureau = 'Finance Bureau';
    }

    const caseId = await getNextCaseId();
    const disposalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const complaint = await Complaint.create({
      caseId,
      institutionId: institution._id,
      institutionName: institution.name,
      aictePermanentId: institution.aictePermanentId,
      complainantType: ['Student', 'Faculty', 'Staff', 'Other'].includes(complainantType) ? complainantType : 'Student',
      complainantName: complainantName.trim(),
      complainantEmail: complainantEmail.trim().toLowerCase(),
      complainantPhone: complainantPhone ? complainantPhone.trim() : '',
      complainantIdNumber: complainantIdNumber ? complainantIdNumber.trim() : '',
      department: department ? department.trim() : 'General',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      category,
      subject: subject.trim(),
      description: description.trim(),
      priority,
      status: 'Received',
      assignedBureau,
      assignedOfficer: null,
      assignedOfficerName: 'Unassigned',
      expectedDisposalDate: disposalDate,
      createdBy: null,
      updatedBy: null
    });

    // Record initial CaseHistory entry
    await CaseHistory.create({
      complaintId: complaint._id,
      caseId: complaint.caseId,
      actionType: ACTION_TYPES.CREATED,
      previousStatus: null,
      newStatus: 'Received',
      previousBureau: null,
      newBureau: assignedBureau,
      officerId: null,
      officerDisplayName: `Public Portal (${complainantType})`,
      remarks: `Official grievance lodged by verified ${complainantType}: ${complainantName} (${complainantEmail}) [Identity: ${complainantIdNumber || 'N/A'}, Dept: ${department || 'General'}]. Email authenticated via OTP verification code. Auto-routed to ${assignedBureau}.`
    });

    // Run Overlap Detection Engine across institution cases
    const detectedOverlaps = await detectOverlapsForInstitution(institution._id, complaint.caseId);

    return sendSuccess(res, 'Official grievance registered and authenticated successfully.', {
      complaint,
      caseId: complaint.caseId,
      detectedOverlapsCount: detectedOverlaps.length,
      trackingUrl: `/track-complaint?caseId=${complaint.caseId}`
    }, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * Public endpoint to track an existing grievance by Case ID
 */
export async function trackPublicComplaint(req, res, next) {
  try {
    const { caseId } = req.params;
    if (!caseId) {
      return sendError(res, 'Please provide a Case ID to track.', 400);
    }

    const complaint = await Complaint.findOne({ caseId: caseId.trim().toUpperCase() })
      .select('caseId institutionName aictePermanentId category subject description status priority receivedAt dateOfLastAction expectedDisposalDate nextAction assignedBureau complainantType complainantName emailVerified')
      .lean();

    if (!complaint) {
      return sendError(res, 'No complaint dossier found matching this Case ID. Please verify your tracking ID.', 404);
    }

    const history = await CaseHistory.find({ caseId: complaint.caseId })
      .select('actionType previousStatus newStatus newBureau remarks createdAt officerDisplayName')
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 'Complaint tracking dossier retrieved successfully.', {
      complaint,
      history
    });
  } catch (err) {
    next(err);
  }
}
