import mongoose from 'mongoose';
import {
  BUREAUS,
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  COMPLAINT_PRIORITIES
} from '../config/roles.js';

const complaintSchema = new mongoose.Schema({
  caseId: {
    type: String,
    required: [true, 'Case ID is required'],
    unique: true,
    trim: true,
    index: true
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: [true, 'Institution reference is required'],
    index: true
  },
  institutionName: {
    type: String,
    required: true,
    trim: true
  },
  aictePermanentId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  receivedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: COMPLAINT_CATEGORIES,
    index: true
  },
  subject: {
    type: String,
    required: [true, 'Complaint subject is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
    trim: true
  },
  priority: {
    type: String,
    enum: COMPLAINT_PRIORITIES,
    default: 'Medium',
    index: true
  },
  status: {
    type: String,
    enum: COMPLAINT_STATUSES,
    default: 'Received',
    index: true
  },
  assignedBureau: {
    type: String,
    enum: BUREAUS,
    required: [true, 'Assigned Bureau is required'],
    index: true
  },
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  assignedOfficerName: {
    type: String,
    default: 'Unassigned'
  },
  dateOfLastAction: {
    type: Date,
    default: Date.now
  },
  nextAction: {
    type: String,
    default: 'Initial Bureau Scrutiny'
  },
  complainantType: {
    type: String,
    enum: ['Student', 'Faculty', 'Staff', 'Other'],
    default: 'Student',
    index: true
  },
  complainantName: {
    type: String,
    trim: true,
    default: 'Anonymous Complainant'
  },
  complainantEmail: {
    type: String,
    trim: true,
    lowercase: true,
    index: true
  },
  complainantPhone: {
    type: String,
    trim: true,
    default: ''
  },
  complainantIdNumber: {
    type: String,
    trim: true,
    default: '' // Student Roll No or Faculty ID
  },
  department: {
    type: String,
    trim: true,
    default: 'General'
  },
  emailVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  emailVerifiedAt: {
    type: Date,
    default: null
  },
  expectedDisposalDate: {
    type: Date,
    required: true,
    index: true
  },
  disposedAt: {
    type: Date,
    default: null,
    index: true
  },
  relatedCases: [{
    type: String,
    trim: true
  }],
  documents: [{
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    originalName: String,
    storageKey: String,
    mimeType: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

complaintSchema.index({
  subject: 'text',
  description: 'text',
  institutionName: 'text',
  caseId: 'text'
});

export const Complaint = mongoose.model('Complaint', complaintSchema);
