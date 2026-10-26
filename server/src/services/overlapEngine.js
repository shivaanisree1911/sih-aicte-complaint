import crypto from 'crypto';
import { Complaint } from '../models/Complaint.js';
import { Overlap } from '../models/Overlap.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { ROLES } from '../config/roles.js';
import { calculateJaccardSimilarity, areCategoriesSynergistic } from '../utils/jaccard.js';
import { logger } from '../utils/logger.js';

/**
 * Generate a deterministic deduplication hash for an overlap cluster.
 */
function generateOverlapKey(institutionId, caseIds) {
  const sortedCaseIds = [...caseIds].sort().join(':');
  return crypto.createHash('sha256').update(`${institutionId}_${sortedCaseIds}`).digest('hex');
}

/**
 * Scan an institution for active cross-bureau complaints and calculate potential overlaps.
 * @param {string|ObjectId} institutionId
 * @param {string} triggerCaseId
 */
export async function detectOverlapsForInstitution(institutionId, triggerCaseId = null) {
  try {
    // 1. Fetch all active complaints for this institution
    // Ignore Disposed or Closed complaints (Rule 6)
    const activeComplaints = await Complaint.find({
      institutionId,
      status: { $nin: ['Disposed', 'Closed'] }
    }).sort({ receivedAt: -1 });

    if (activeComplaints.length < 2) {
      // No active overlap possible with fewer than 2 active complaints
      return [];
    }

    const detectedOverlaps = [];

    // 2. Compare pairs of complaints
    for (let i = 0; i < activeComplaints.length; i++) {
      for (let j = i + 1; j < activeComplaints.length; j++) {
        const c1 = activeComplaints[i];
        const c2 = activeComplaints[j];

        const matchReasons = [];
        let similarityScore = 0;
        let isCrossBureau = false;

        // Check Rule 1: Different Bureaus/Cells
        if (c1.assignedBureau !== c2.assignedBureau) {
          isCrossBureau = true;
          matchReasons.push(
            `Cross-Bureau Action: Case ${c1.caseId} is assigned to [${c1.assignedBureau}] while Case ${c2.caseId} is assigned to [${c2.assignedBureau}].`
          );
        }

        // Check Rule 2: Text similarity (Subject + Description)
        const text1 = `${c1.subject} ${c1.description}`;
        const text2 = `${c2.subject} ${c2.description}`;
        const jaccardScore = calculateJaccardSimilarity(text1, text2);
        similarityScore = jaccardScore;

        if (jaccardScore >= 0.25) {
          matchReasons.push(
            `High Text & Allegation Similarity: Content similarity score is ${(jaccardScore * 100).toFixed(0)}%.`
          );
        }

        // Check Rule 3: Category synergy
        const categoryMatch = areCategoriesSynergistic(c1.category, c2.category);
        if (c1.category === c2.category) {
          matchReasons.push(`Identical Complaint Category: Both cases involve [${c1.category}].`);
        } else if (categoryMatch) {
          matchReasons.push(`Correlated Regulatory Categories: [${c1.category}] and [${c2.category}] frequently correlate in institutional scrutiny.`);
        }

        // Check Rule 5: Explicitly linked cases
        const explicitlyLinked = (c1.relatedCases && c1.relatedCases.includes(c2.caseId)) ||
                                 (c2.relatedCases && c2.relatedCases.includes(c1.caseId));
        if (explicitlyLinked) {
          matchReasons.push(`Previously Linked Cases: Cross-referenced in case records.`);
        }

        // Determine if overlap exists and compute severity
        let severity = null;

        if (isCrossBureau && (jaccardScore >= 0.25 || categoryMatch || explicitlyLinked)) {
          // High Severity: Cross bureau AND (high content similarity OR correlated categories)
          severity = 'High';
        } else if (isCrossBureau) {
          // Medium Severity: Cross bureau for same institution
          severity = 'Medium';
          matchReasons.push('Concurrent active complaints handled independently across distinct Bureaus.');
        } else if (jaccardScore >= 0.35 || categoryMatch) {
          // Low Severity: Same bureau, but potential internal duplicate or related grievance
          severity = 'Low';
          matchReasons.push(`Intra-Bureau synergy detected within [${c1.assignedBureau}].`);
        }

        if (severity) {
          const caseIds = [c1.caseId, c2.caseId];
          const complaintIds = [c1._id, c2._id];
          const bureausInvolved = [...new Set([c1.assignedBureau, c2.assignedBureau])];
          const overlapKey = generateOverlapKey(institutionId.toString(), caseIds);

          // Check if overlap already recorded
          let existingOverlap = await Overlap.findOne({ overlapKey });

          if (!existingOverlap) {
            // Create new Overlap record
            const newOverlap = await Overlap.create({
              overlapKey,
              institutionId: c1.institutionId,
              institutionName: c1.institutionName,
              aictePermanentId: c1.aictePermanentId,
              complaintIds,
              caseIds,
              bureausInvolved,
              matchReasons,
              similarityScore,
              severity,
              reviewStatus: 'New',
              detectedAt: new Date()
            });

            // Dispatch Notifications to Senior Management and relevant Bureau Officers
            await dispatchOverlapNotifications(newOverlap, c1, c2);

            detectedOverlaps.push(newOverlap);
            logger.info(`Detected new ${severity}-severity overlap between ${c1.caseId} and ${c2.caseId}`);
          } else if (existingOverlap.reviewStatus !== 'Dismissed as Not Related') {
            // Update match reasons and similarity if changed
            existingOverlap.matchReasons = matchReasons;
            existingOverlap.similarityScore = similarityScore;
            existingOverlap.severity = severity;
            await existingOverlap.save();
            detectedOverlaps.push(existingOverlap);
          }
        }
      }
    }

    return detectedOverlaps;
  } catch (error) {
    logger.error('Error during overlap detection', error);
    return [];
  }
}

/**
 * Dispatches notification alerts to stakeholders when a potential overlap is flagged.
 */
async function dispatchOverlapNotifications(overlap, c1, c2) {
  try {
    // Notify Senior Management & Super Admins
    const recipients = await User.find({
      role: { $in: [ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT] },
      isActive: true
    }).select('_id');

    // Also notify assigned officers of c1 and c2 if assigned
    const assignedUserIds = [c1.assignedOfficer, c2.assignedOfficer].filter(Boolean);

    const targetUserIds = [
      ...new Set([
        ...recipients.map(u => u._id.toString()),
        ...assignedUserIds.map(id => id.toString())
      ])
    ];

    const notifications = targetUserIds.map(userId => ({
      recipientId: userId,
      type: 'OVERLAP_DETECTED',
      title: `Potential Overlap Detected (${overlap.severity} Priority)`,
      message: `Cases ${c1.caseId} (${c1.assignedBureau}) and ${c2.caseId} (${c2.assignedBureau}) for "${c1.institutionName}" show operational overlap. Coordination recommended.`,
      complaintId: c1._id,
      caseId: c1.caseId,
      overlapId: overlap._id,
      isRead: false
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (err) {
    logger.error('Failed to dispatch overlap notifications', err);
  }
}
