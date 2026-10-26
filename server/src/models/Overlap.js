import mongoose from 'mongoose';
import { OVERLAP_SEVERITIES, OVERLAP_STATUSES } from '../config/roles.js';

const overlapSchema = new mongoose.Schema({
  overlapKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true,
    index: true
  },
  institutionName: {
    type: String,
    required: true
  },
  aictePermanentId: {
    type: String,
    required: true
  },
  complaintIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  }],
  caseIds: [{
    type: String,
    required: true
  }],
  bureausInvolved: [{
    type: String,
    required: true
  }],
  matchReasons: [{
    type: String
  }],
  similarityScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  severity: {
    type: String,
    enum: OVERLAP_SEVERITIES,
    default: 'Medium',
    index: true
  },
  reviewStatus: {
    type: String,
    enum: OVERLAP_STATUSES,
    default: 'New',
    index: true
  },
  coordinatingOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  coordinatingOfficerName: {
    type: String,
    default: 'Unassigned'
  },
  reviewRemarks: {
    type: String,
    default: ''
  },
  dismissalReason: {
    type: String,
    default: ''
  },
  detectedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export const Overlap = mongoose.model('Overlap', overlapSchema);
