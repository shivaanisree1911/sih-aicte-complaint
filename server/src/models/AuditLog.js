import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  actorName: {
    type: String,
    default: 'System'
  },
  actorEmail: {
    type: String,
    default: 'system@aicte.gov.in'
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  resourceType: {
    type: String,
    required: true,
    index: true
  },
  resourceId: {
    type: String,
    required: true,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true
  }
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
