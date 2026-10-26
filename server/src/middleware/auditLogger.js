import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

export async function logAuditEvent({ actor, action, resourceType, resourceId, metadata = {}, ipAddress = '127.0.0.1' }) {
  try {
    // Sanitize metadata to avoid capturing sensitive tokens or passwords
    const sanitizedMetadata = { ...metadata };
    delete sanitizedMetadata.password;
    delete sanitizedMetadata.passwordHash;
    delete sanitizedMetadata.token;
    delete sanitizedMetadata.authorization;

    await AuditLog.create({
      actorId: actor?._id || null,
      actorName: actor?.name || 'System',
      actorEmail: actor?.email || 'system@aicte.gov.in',
      action,
      resourceType,
      resourceId: String(resourceId),
      metadata: sanitizedMetadata,
      ipAddress
    });
  } catch (err) {
    logger.error('Failed to write audit log entry', err);
  }
}
