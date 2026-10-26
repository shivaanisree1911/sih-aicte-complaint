import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'OVERLAP_DETECTED',
      'CASE_ASSIGNED',
      'CASE_TRANSFERRED',
      'CASE_ESCALATED',
      'DEADLINE_APPROACHING',
      'CASE_OVERDUE',
      'CASE_DISPOSED',
      'SYSTEM'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    default: null
  },
  caseId: {
    type: String,
    default: null
  },
  overlapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Overlap',
    default: null
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
