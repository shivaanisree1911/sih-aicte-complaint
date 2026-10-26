import mongoose from 'mongoose';
import { REGIONS } from '../config/roles.js';

const institutionSchema = new mongoose.Schema({
  aictePermanentId: {
    type: String,
    required: [true, 'AICTE Permanent ID is required'],
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true,
    index: true
  },
  institutionType: {
    type: String,
    required: true,
    enum: [
      'Engineering & Technology',
      'Management',
      'Pharmacy',
      'Architecture',
      'Polytechnic',
      'Applied Arts & Crafts',
      'Hotel Management & Catering',
      'Other'
    ],
    default: 'Engineering & Technology'
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  region: {
    type: String,
    required: true,
    enum: REGIONS,
    index: true
  },
  contactDetails: {
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    principalName: { type: String, trim: true },
    website: { type: String, trim: true }
  },
  institutionStatus: {
    type: String,
    enum: ['Approved', 'Under Scrutiny', 'Show Cause Issued', 'Withdrawn', 'Suspended'],
    default: 'Approved',
    index: true
  }
}, {
  timestamps: true
});

// Text index for search
institutionSchema.index({
  name: 'text',
  aictePermanentId: 'text',
  district: 'text',
  state: 'text'
});

export const Institution = mongoose.model('Institution', institutionSchema);
