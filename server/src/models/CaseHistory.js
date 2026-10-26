import mongoose from 'mongoose';
import { ACTION_TYPES } from '../config/roles.js';

const caseHistorySchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true,
    index: true
  },
  caseId: {
    type: String,
    required: true,
    index: true
  },
  actionType: {
    type: String,
    enum: Object.values(ACTION_TYPES),
    required: true
  },
  previousStatus: {
    type: String,
    default: null
  },
  newStatus: {
    type: String,
    default: null
  },
  previousBureau: {
    type: String,
    default: null
  },
  newBureau: {
    type: String,
    default: null
  },
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  officerDisplayName: {
    type: String,
    required: true
  },
  remarks: {
    type: String,
    default: ''
  },
  documentReferences: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true
  }
});

export const CaseHistory = mongoose.model('CaseHistory', caseHistorySchema);
