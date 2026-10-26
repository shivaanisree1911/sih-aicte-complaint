import { Complaint } from '../models/Complaint.js';
import { Overlap } from '../models/Overlap.js';
import { Institution } from '../models/Institution.js';
import { CaseHistory } from '../models/CaseHistory.js';
import { BUREAUS, REGIONS, ROLES } from '../config/roles.js';
import { sendSuccess } from '../utils/response.js';

export async function getDashboardSummary(req, res, next) {
  try {
    const now = new Date();
    const filter = {};

    // RBAC Scope for Dashboard Metrics:
    // 1. Student / Faculty: can ONLY view metrics for their own complaints
    if (req.user.role === ROLES.STUDENT || req.user.role === ROLES.FACULTY) {
      filter.$or = [
        { createdBy: req.user._id },
        { complainantEmail: req.user.email.toLowerCase() }
      ];
    }
    // 2. Principal: can ONLY view metrics for their own college
    else if (req.user.role === ROLES.PRINCIPAL) {
      if (req.user.institutionId) {
        filter.institutionId = req.user.institutionId;
      } else if (req.user.institutionName) {
        filter.institutionName = new RegExp(req.user.institutionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      }
    }
    // 3. Regional Officer: scope to their region
    else if (req.user.role === ROLES.REGIONAL_OFFICER && req.user.region !== 'All') {
      const regInsts = await Institution.find({ region: req.user.region }).select('_id');
      filter.institutionId = { $in: regInsts.map(i => i._id) };
    }

    const [
      total,
      pending,
      underProcess,
      disposed,
      transferred,
      escalated,
      overdue,
      activeOverlaps,
      studentComplaints,
      facultyComplaints
    ] = await Promise.all([
      Complaint.countDocuments(filter),
      Complaint.countDocuments({ ...filter, status: 'Pending' }),
      Complaint.countDocuments({ ...filter, status: 'Under Process' }),
      Complaint.countDocuments({ ...filter, status: { $in: ['Disposed', 'Closed'] } }),
      Complaint.countDocuments({ ...filter, status: 'Transferred' }),
      Complaint.countDocuments({ ...filter, status: 'Escalated' }),
      Complaint.countDocuments({
        ...filter,
        status: { $nin: ['Disposed', 'Closed'] },
        expectedDisposalDate: { $lt: now }
      }),
      Overlap.countDocuments({
        reviewStatus: { $in: ['New', 'Under Review', 'Coordination Required'] }
      }),
      Complaint.countDocuments({ ...filter, complainantType: 'Student' }),
      Complaint.countDocuments({ ...filter, complainantType: 'Faculty' })
    ]);

    // Disposal rate formula:
    // Disposal Rate = (Disposed Cases / Total Cases) * 100
    const disposalRate = total > 0 ? Math.round((disposed / total) * 100) : 0;

    return sendSuccess(res, 'Dashboard summary metrics retrieved.', {
      summary: {
        total,
        pending,
        underProcess,
        disposed,
        transferred,
        escalated,
        overdue,
        activeOverlaps,
        disposalRate,
        studentComplaints,
        facultyComplaints
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getDashboardTrends(req, res, next) {
  try {
    // Generate last 6 months trend
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const monthName = d.toLocaleString('default', { month: 'short' });
      months.push({ start, end, label: monthName });
    }

    const trends = await Promise.all(
      months.map(async ({ start, end, label }) => {
        const [received, disposed] = await Promise.all([
          Complaint.countDocuments({
            receivedAt: { $gte: start, $lte: end }
          }),
          Complaint.countDocuments({
            disposedAt: { $gte: start, $lte: end }
          })
        ]);
        return {
          month: label,
          received,
          disposed
        };
      })
    );

    return sendSuccess(res, 'Monthly trends retrieved.', { trends });
  } catch (err) {
    next(err);
  }
}

export async function getBureauWorkload(req, res, next) {
  try {
    const workload = await Complaint.aggregate([
      {
        $group: {
          _id: '$assignedBureau',
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $in: ['$status', ['Disposed', 'Closed']] }, 0, 1]
            }
          },
          disposed: {
            $sum: {
              $cond: [{ $in: ['$status', ['Disposed', 'Closed']] }, 1, 0]
            }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Ensure all bureaus are represented
    const bureauMap = {};
    workload.forEach(b => {
      bureauMap[b._id] = b;
    });

    const enriched = BUREAUS.map(bureau => ({
      bureau,
      total: bureauMap[bureau]?.total || 0,
      active: bureauMap[bureau]?.active || 0,
      disposed: bureauMap[bureau]?.disposed || 0
    }));

    return sendSuccess(res, 'Bureau workload retrieved.', { workload: enriched });
  } catch (err) {
    next(err);
  }
}

export async function getRegionDistribution(req, res, next) {
  try {
    const distribution = await Complaint.aggregate([
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
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const regionMap = {};
    distribution.forEach(d => {
      if (d._id) regionMap[d._id] = d.count;
    });

    const enriched = REGIONS.map(region => ({
      region,
      count: regionMap[region] || 0
    }));

    return sendSuccess(res, 'Regional distribution retrieved.', { distribution: enriched });
  } catch (err) {
    next(err);
  }
}

export async function getAgeingAnalysis(req, res, next) {
  try {
    const now = new Date();
    const activeComplaints = await Complaint.find({
      status: { $nin: ['Disposed', 'Closed'] }
    }).select('receivedAt');

    let under15 = 0;
    let from15to30 = 0;
    let from30to60 = 0;
    let over60 = 0;

    activeComplaints.forEach(c => {
      const ageDays = (now - new Date(c.receivedAt)) / (1000 * 60 * 60 * 24);
      if (ageDays < 15) {
        under15++;
      } else if (ageDays <= 30) {
        from15to30++;
      } else if (ageDays <= 60) {
        from30to60++;
      } else {
        over60++;
      }
    });

    const ageing = [
      { range: '< 15 Days', count: under15, color: '#10b981' },
      { range: '15 - 30 Days', count: from15to30, color: '#3b82f6' },
      { range: '31 - 60 Days', count: from30to60, color: '#f59e0b' },
      { range: '> 60 Days', count: over60, color: '#ef4444' }
    ];

    return sendSuccess(res, 'Ageing analysis retrieved.', { ageing });
  } catch (err) {
    next(err);
  }
}

export async function getRecentActivity(req, res, next) {
  try {
    const recent = await Complaint.find()
      .sort({ updatedAt: -1 })
      .limit(8)
      .populate('assignedOfficer', 'name role')
      .lean();

    // Check if any recent case is involved in active overlap
    const caseIds = recent.map(r => r.caseId);
    const overlaps = await Overlap.find({
      caseIds: { $in: caseIds },
      reviewStatus: { $ne: 'Dismissed as Not Related' }
    }).select('caseIds severity reviewStatus');

    const overlapMap = {};
    overlaps.forEach(o => {
      o.caseIds.forEach(id => {
        overlapMap[id] = { severity: o.severity, status: o.reviewStatus };
      });
    });

    const enriched = recent.map(r => ({
      ...r,
      overlapWarning: overlapMap[r.caseId] || null
    }));

    return sendSuccess(res, 'Recent activity retrieved.', { recent: enriched });
  } catch (err) {
    next(err);
  }
}
