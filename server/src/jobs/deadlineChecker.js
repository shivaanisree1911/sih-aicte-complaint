import { Complaint } from '../models/Complaint.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { ROLES } from '../config/roles.js';
import { logger } from '../utils/logger.js';

export async function runDeadlineCheck() {
  try {
    const now = new Date();
    const thresholdDays = parseInt(process.env.DEADLINE_APPROACHING_DAYS, 10) || 3;
    const approachingDeadline = new Date(now.getTime() + thresholdDays * 24 * 60 * 60 * 1000);

    // Active complaints only
    const activeComplaints = await Complaint.find({
      status: { $nin: ['Disposed', 'Closed'] }
    });

    const superAdminsAndManagement = await User.find({
      role: { $in: [ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT] },
      isActive: true
    }).select('_id');

    let createdCount = 0;

    for (const complaint of activeComplaints) {
      if (!complaint.expectedDisposalDate) continue;

      const dueDate = new Date(complaint.expectedDisposalDate);
      const isOverdue = dueDate < now;
      const isApproaching = !isOverdue && dueDate <= approachingDeadline;

      if (!isOverdue && !isApproaching) continue;

      const type = isOverdue ? 'CASE_OVERDUE' : 'DEADLINE_APPROACHING';
      const title = isOverdue
        ? `OVERDUE CASE: ${complaint.caseId}`
        : `Approaching Deadline: ${complaint.caseId}`;

      const remainingDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      const message = isOverdue
        ? `Case ${complaint.caseId} for "${complaint.institutionName}" (${complaint.assignedBureau}) passed expected disposal deadline (${dueDate.toLocaleDateString()}). Urgent review required.`
        : `Case ${complaint.caseId} for "${complaint.institutionName}" (${complaint.assignedBureau}) is due within ${remainingDays} day(s) on ${dueDate.toLocaleDateString()}.`;

      // Determine recipients: assigned officer + senior management
      const recipientIds = new Set();
      if (complaint.assignedOfficer) {
        recipientIds.add(complaint.assignedOfficer.toString());
      }
      superAdminsAndManagement.forEach(u => recipientIds.add(u._id.toString()));

      for (const recipientId of recipientIds) {
        // Prevent duplicate spam: check if an identical notification was sent in past 24 hours
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const existing = await Notification.findOne({
          recipientId,
          type,
          complaintId: complaint._id,
          createdAt: { $gte: oneDayAgo }
        });

        if (!existing) {
          await Notification.create({
            recipientId,
            type,
            title,
            message,
            complaintId: complaint._id,
            caseId: complaint.caseId,
            isRead: false
          });
          createdCount++;
        }
      }
    }

    if (createdCount > 0) {
      logger.info(`Deadline checker generated ${createdCount} alerts.`);
    }
  } catch (err) {
    logger.error('Error running deadline check job', err);
  }
}

/**
 * Initialize background interval runner for deadline checks.
 */
export function startDeadlineJob(intervalMs = 60 * 60 * 1000) {
  // Run once shortly after startup
  setTimeout(() => {
    runDeadlineCheck();
  }, 10000);

  // Then recurring schedule
  setInterval(runDeadlineCheck, intervalMs);
  logger.info('Scheduled deadline alert job started.');
}
