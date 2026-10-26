import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
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
  originalName: {
    type: String,
    required: true
  },
  storageKey: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
});

export const Document = mongoose.model('Document', documentSchema);
