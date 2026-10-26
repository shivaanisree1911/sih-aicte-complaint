import { Overlap } from '../models/Overlap.js';
import { Complaint } from '../models/Complaint.js';
import { Institution } from '../models/Institution.js';
import { CaseHistory } from '../models/CaseHistory.js';
import { User } from '../models/User.js';
import { ACTION_TYPES } from '../config/roles.js';
import { detectOverlapsForInstitution } from '../services/overlapEngine.js';
import { logAuditEvent } from '../middleware/auditLogger.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

export async function getOverlaps(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { severity, reviewStatus, bureau, search } = req.query;
    const query = {};

    if (severity && severity !== 'All') {
      query.severity = severity;
    }

    if (reviewStatus && reviewStatus !== 'All') {
      query.reviewStatus = reviewStatus;
    }

    if (bureau && bureau !== 'All') {
      query.bureausInvolved = bureau;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { institutionName: regex },
        { aictePermanentId: regex },
        { caseIds: regex }
      ];
    }

    const [overlaps, total] = await Promise.all([
      Overlap.find(query)
        .sort({ detectedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('complaintIds')
        .populate('coordinatingOfficer', 'name email role')
        .lean(),
      Overlap.countDocuments(query)
    ]);

    return sendPaginated(res, 'Overlaps retrieved successfully.', overlaps, {
      total,
      page,
      limit
    });
  } catch (err) {
    next(err);
  }
}

export async function getOverlapById(req, res, next) {
  try {
    const overlap = await Overlap.findById(req.params.id)
      .populate({
        path: 'complaintIds',
        populate: [
          { path: 'assignedOfficer', select: 'name email role bureau' },
          { path: 'institutionId' }
        ]
      })
      .populate('coordinatingOfficer', 'name email role');

    if (!overlap) {
      return sendError(res, 'Overlap alert record not found.', 404);
    }

    return sendSuccess(res, 'Overlap details retrieved.', { overlap });
  } catch (err) {
    next(err);
  }
}

export async function reviewOverlap(req, res, next) {
  try {
    const { reviewStatus, coordinatingOfficerId, reviewRemarks } = req.body;
    const overlap = await Overlap.findById(req.params.id);
    if (!overlap) {
      return sendError(res, 'Overlap record not found.', 404);
    }

    if (reviewStatus) {
      overlap.reviewStatus = reviewStatus;
    }

    if (coordinatingOfficerId) {
      const officer = await User.findById(coordinatingOfficerId);
      if (officer) {
        overlap.coordinatingOfficer = officer._id;
        overlap.coordinatingOfficerName = officer.name;
      }
    }

    if (reviewRemarks) {
      overlap.reviewRemarks = reviewRemarks;
    }

    await overlap.save();

    await logAuditEvent({
      actor: req.user,
      action: 'REVIEW_OVERLAP',
      resourceType: 'Overlap',
      resourceId: overlap._id,
      metadata: { status: overlap.reviewStatus, coordinator: overlap.coordinatingOfficerName },
      ipAddress: req.ip
    });

    return sendSuccess(res, 'Overlap review status updated.', { overlap });
  } catch (err) {
    next(err);
  }
}

export async function linkCases(req, res, next) {
  try {
    const { remarks } = req.body;
    const overlap = await Overlap.findById(req.params.id).populate('complaintIds');
    if (!overlap) {
      return sendError(res, 'Overlap record not found.', 404);
    }

    const caseIds = overlap.caseIds;
    // Cross-link each complaint with all other complaints in this overlap
    for (const complaint of overlap.complaintIds) {
      const otherCaseIds = caseIds.filter(id => id !== complaint.caseId);
      const updatedRelated = [...new Set([...(complaint.relatedCases || []), ...otherCaseIds])];
      
      complaint.relatedCases = updatedRelated;
      await complaint.save();

      await CaseHistory.create({
        complaintId: complaint._id,
        caseId: complaint.caseId,
        actionType: ACTION_TYPES.LINKED_OVERLAP,
        previousStatus: complaint.status,
        newStatus: complaint.status,
        officerId: req.user._id,
        officerDisplayName: req.user.name,
        remarks: remarks || `Inter-Bureau Case Coordination established with: ${otherCaseIds.join(', ')}.`
      });
    }

    overlap.reviewStatus = 'Coordination Required';
    if (remarks) overlap.reviewRemarks = remarks;
    await overlap.save();

    return sendSuccess(res, 'Cases linked successfully for cross-bureau coordination.', { overlap });
  } catch (err) {
    next(err);
  }
}

export async function resolveOverlap(req, res, next) {
  try {
    const { remarks } = req.body;
    const overlap = await Overlap.findById(req.params.id);
    if (!overlap) {
      return sendError(res, 'Overlap record not found.', 404);
    }

    overlap.reviewStatus = 'Resolved';
    overlap.resolvedAt = new Date();
    if (remarks) overlap.reviewRemarks = remarks;
    await overlap.save();

    await logAuditEvent({
      actor: req.user,
      action: 'RESOLVE_OVERLAP',
      resourceType: 'Overlap',
      resourceId: overlap._id,
      metadata: { remarks },
      ipAddress: req.ip
    });

    return sendSuccess(res, 'Overlap marked as resolved.', { overlap });
  } catch (err) {
    next(err);
  }
}

export async function dismissOverlap(req, res, next) {
  try {
    const { dismissalReason } = req.body;
    if (!dismissalReason || !dismissalReason.trim()) {
      return sendError(res, 'A documented dismissal reason is mandatory.', 400);
    }

    const overlap = await Overlap.findById(req.params.id);
    if (!overlap) {
      return sendError(res, 'Overlap record not found.', 404);
    }

    overlap.reviewStatus = 'Dismissed as Not Related';
    overlap.dismissalReason = dismissalReason.trim();
    overlap.resolvedAt = new Date();
    await overlap.save();

    await logAuditEvent({
      actor: req.user,
      action: 'DISMISS_OVERLAP',
      resourceType: 'Overlap',
      resourceId: overlap._id,
      metadata: { reason: dismissalReason },
      ipAddress: req.ip
    });

    return sendSuccess(res, 'Overlap dismissed with documented justification.', { overlap });
  } catch (err) {
    next(err);
  }
}

export async function scanAllInstitutions(req, res, next) {
  try {
    const institutions = await Institution.find().select('_id');
    let totalDetected = 0;

    for (const inst of institutions) {
      const detected = await detectOverlapsForInstitution(inst._id);
      totalDetected += detected.length;
    }

    return sendSuccess(res, `System scan completed. Found ${totalDetected} active potential overlap(s).`, {
      totalDetected
    });
  } catch (err) {
    next(err);
  }
}
