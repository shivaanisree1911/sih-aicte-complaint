import { Complaint } from '../models/Complaint.js';
import { Institution } from '../models/Institution.js';
import { Overlap } from '../models/Overlap.js';
import { User } from '../models/User.js';
import { BUREAUS, REGIONS, COMPLAINT_STATUSES } from '../config/roles.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getBureauReport(req, res, next) {
  try {
    const report = await Complaint.aggregate([
      {
        $group: {
          _id: '$assignedBureau',
          total: { $sum: 1 },
          received: { $sum: { $cond: [{ $eq: ['$status', 'Received'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          underProcess: { $sum: { $cond: [{ $eq: ['$status', 'Under Process'] }, 1, 0] } },
          transferred: { $sum: { $cond: [{ $eq: ['$status', 'Transferred'] }, 1, 0] } },
          escalated: { $sum: { $cond: [{ $eq: ['$status', 'Escalated'] }, 1, 0] } },
          disposed: { $sum: { $cond: [{ $in: ['$status', ['Disposed', 'Closed']] }, 1, 0] } }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const mapped = BUREAUS.map(b => {
      const found = report.find(r => r._id === b) || {};
      const total = found.total || 0;
      const disposed = found.disposed || 0;
      const disposalRate = total > 0 ? Math.round((disposed / total) * 100) : 0;
      return {
        bureau: b,
        total,
        received: found.received || 0,
        pending: found.pending || 0,
        underProcess: found.underProcess || 0,
        transferred: found.transferred || 0,
        escalated: found.escalated || 0,
        disposed,
        disposalRate: `${disposalRate}%`
      };
    });

    return sendSuccess(res, 'Bureau-wise report generated.', { report: mapped });
  } catch (err) {
    next(err);
  }
}

export async function getRegionReport(req, res, next) {
  try {
    const report = await Complaint.aggregate([
      {
        $lookup: {
          from: 'institutions',
          localField: 'institutionId',
          foreignField: '_id',
          as: 'inst'
        }
      },
      { $unwind: '$inst' },
      {
        $group: {
          _id: '$inst.region',
          totalComplaints: { $sum: 1 },
          activeComplaints: {
            $sum: { $cond: [{ $in: ['$status', ['Disposed', 'Closed']] }, 0, 1] }
          },
          disposedComplaints: {
            $sum: { $cond: [{ $in: ['$status', ['Disposed', 'Closed']] }, 1, 0] }
          }
        }
      },
      { $sort: { totalComplaints: -1 } }
    ]);

    const mapped = REGIONS.map(r => {
      const found = report.find(item => item._id === r) || {};
      return {
        region: r,
        totalComplaints: found.totalComplaints || 0,
        activeComplaints: found.activeComplaints || 0,
        disposedComplaints: found.disposedComplaints || 0
      };
    });

    return sendSuccess(res, 'Region-wise report generated.', { report: mapped });
  } catch (err) {
    next(err);
  }
}

export async function getInstitutionReport(req, res, next) {
  try {
    const report = await Complaint.aggregate([
      {
        $group: {
          _id: {
            institutionId: '$institutionId',
            institutionName: '$institutionName',
            aictePermanentId: '$aictePermanentId'
          },
          totalComplaints: { $sum: 1 },
          activeComplaints: {
            $sum: { $cond: [{ $in: ['$status', ['Disposed', 'Closed']] }, 0, 1] }
          },
          disposedComplaints: {
            $sum: { $cond: [{ $in: ['$status', ['Disposed', 'Closed']] }, 1, 0] }
          },
          bureausInvolved: { $addToSet: '$assignedBureau' }
        }
      },
      { $sort: { totalComplaints: -1 } },
      { $limit: 30 }
    ]);

    const mapped = report.map(r => ({
      institutionId: r._id.institutionId,
      institutionName: r._id.institutionName,
      aictePermanentId: r._id.aictePermanentId,
      totalComplaints: r.totalComplaints,
      activeComplaints: r.activeComplaints,
      disposedComplaints: r.disposedComplaints,
      bureausCount: r.bureausInvolved.length,
      hasCrossBureauActivity: r.bureausInvolved.length > 1
    }));

    return sendSuccess(res, 'Institution-wise summary report generated.', { report: mapped });
  } catch (err) {
    next(err);
  }
}

export async function getStatusReport(req, res, next) {
  try {
    const report = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const mapped = COMPLAINT_STATUSES.map(status => {
      const found = report.find(r => r._id === status);
      return {
        status,
        count: found ? found.count : 0
      };
    });

    return sendSuccess(res, 'Status distribution report generated.', { report: mapped });
  } catch (err) {
    next(err);
  }
}

export async function getOverdueReport(req, res, next) {
  try {
    const now = new Date();
    const overdueCases = await Complaint.find({
      status: { $nin: ['Disposed', 'Closed'] },
      expectedDisposalDate: { $lt: now }
    })
      .sort({ expectedDisposalDate: 1 })
      .populate('assignedOfficer', 'name email role')
      .lean();

    const enriched = overdueCases.map(c => {
      const daysOverdue = Math.floor((now - new Date(c.expectedDisposalDate)) / (1000 * 60 * 60 * 24));
      return {
        ...c,
        daysOverdue
      };
    });

    return sendSuccess(res, 'Overdue cases report generated.', { report: enriched });
  } catch (err) {
    next(err);
  }
}

export async function getOverlapReport(req, res, next) {
  try {
    const overlaps = await Overlap.find()
      .sort({ detectedAt: -1 })
      .populate('complaintIds', 'caseId category priority status assignedBureau')
      .lean();

    return sendSuccess(res, 'Overlap alerts report generated.', { report: overlaps });
  } catch (err) {
    next(err);
  }
}

export async function getOfficerWorkloadReport(req, res, next) {
  try {
    const officers = await User.find({
      role: { $in: ['bureau_officer', 'regional_officer'] },
      isActive: true
    }).select('name email role bureau region').lean();

    const workloadCounts = await Complaint.aggregate([
      { $match: { assignedOfficer: { $ne: null } } },
      {
        $group: {
          _id: '$assignedOfficer',
          totalAssigned: { $sum: 1 },
          activeAssigned: {
            $sum: { $cond: [{ $in: ['$status', ['Disposed', 'Closed']] }, 0, 1] }
          },
          disposedAssigned: {
            $sum: { $cond: [{ $in: ['$status', ['Disposed', 'Closed']] }, 1, 0] }
          }
        }
      }
    ]);

    const countMap = {};
    workloadCounts.forEach(w => {
      countMap[w._id.toString()] = w;
    });

    const report = officers.map(o => {
      const stats = countMap[o._id.toString()] || { totalAssigned: 0, activeAssigned: 0, disposedAssigned: 0 };
      return {
        officerId: o._id,
        name: o.name,
        email: o.email,
        role: o.role,
        bureau: o.bureau,
        region: o.region,
        totalAssigned: stats.totalAssigned,
        activeAssigned: stats.activeAssigned,
        disposedAssigned: stats.disposedAssigned
      };
    });

    return sendSuccess(res, 'Officer workload report generated.', { report });
  } catch (err) {
    next(err);
  }
}

export async function exportReportCSV(req, res, next) {
  try {
    const { type = 'complaints' } = req.query;

    if (type === 'complaints') {
      const complaints = await Complaint.find().sort({ receivedAt: -1 }).lean();

      const headers = [
        'Case ID',
        'AICTE Permanent ID',
        'Institution Name',
        'Category',
        'Subject',
        'Priority',
        'Status',
        'Assigned Bureau',
        'Assigned Officer',
        'Date Received',
        'Expected Disposal Date',
        'Disposed Date'
      ];

      const rows = complaints.map(c => [
        `"${c.caseId}"`,
        `"${c.aictePermanentId}"`,
        `"${(c.institutionName || '').replace(/"/g, '""')}"`,
        `"${c.category}"`,
        `"${(c.subject || '').replace(/"/g, '""')}"`,
        `"${c.priority}"`,
        `"${c.status}"`,
        `"${c.assignedBureau}"`,
        `"${c.assignedOfficerName || 'Unassigned'}"`,
        `"${c.receivedAt ? new Date(c.receivedAt).toLocaleDateString() : ''}"`,
        `"${c.expectedDisposalDate ? new Date(c.expectedDisposalDate).toLocaleDateString() : ''}"`,
        `"${c.disposedAt ? new Date(c.disposedAt).toLocaleDateString() : ''}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="AICTE_Complaints_Report_${Date.now()}.csv"`);
      return res.send(csvContent);
    } else if (type === 'overlaps') {
      const overlaps = await Overlap.find().sort({ detectedAt: -1 }).lean();

      const headers = [
        'Overlap ID',
        'Institution Name',
        'AICTE Permanent ID',
        'Case IDs',
        'Bureaus Involved',
        'Severity',
        'Review Status',
        'Similarity Score',
        'Detected At'
      ];

      const rows = overlaps.map(o => [
        `"${o._id}"`,
        `"${(o.institutionName || '').replace(/"/g, '""')}"`,
        `"${o.aictePermanentId}"`,
        `"${(o.caseIds || []).join('; ')}"`,
        `"${(o.bureausInvolved || []).join('; ')}"`,
        `"${o.severity}"`,
        `"${o.reviewStatus}"`,
        `"${o.similarityScore}"`,
        `"${new Date(o.detectedAt).toLocaleDateString()}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="AICTE_Overlaps_Report_${Date.now()}.csv"`);
      return res.send(csvContent);
    }

    return sendError(res, 'Unsupported export type.', 400);
  } catch (err) {
    next(err);
  }
}
