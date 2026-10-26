import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, BUREAUS, REGIONS } from '../config/roles.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 120
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
    select: false
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.STUDENT,
    required: true,
    index: true
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    default: null,
    index: true
  },
  institutionName: {
    type: String,
    default: ''
  },
  rollOrEmployeeId: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  bureau: {
    type: String,
    default: 'All'
  },
  region: {
    type: String,
    default: 'All'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  return userObject;
};

export const User = mongoose.model('User', userSchema);
