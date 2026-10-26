import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Institution } from '../models/Institution.js';
import { ROLES, BUREAUS, REGIONS } from '../config/roles.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAuditEvent } from '../middleware/auditLogger.js';
import { verifyOtp, isEmailVerified } from '../services/verificationService.js';

function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'aicte_central_sentinel_auth_key_2026_production_vault';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      bureau: user.bureau,
      region: user.region,
      institutionId: user.institutionId,
      institutionName: user.institutionName,
      rollOrEmployeeId: user.rollOrEmployeeId
    },
    secret,
    { expiresIn }
  );
}

export async function register(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      role = ROLES.STUDENT,
      bureau,
      region,
      institutionId,
      institutionName,
      rollOrEmployeeId,
      department,
      otpCode
    } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Please provide full name, official email, and password.', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters in length.', 400);
    }

    const emailNormalized = email.trim().toLowerCase();
    const existing = await User.findOne({ email: emailNormalized });
    if (existing) {
      return sendError(res, 'An account with this email address already exists. Please sign in.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const validRole = Object.values(ROLES).includes(role) ? role : ROLES.STUDENT;
    const assignedBureau = bureau && BUREAUS.includes(bureau) ? bureau : 'Public Grievance Redressal Cell (PGRC)';
    const assignedRegion = region && REGIONS.includes(region) ? region : 'Southern';

    // Fetch Institution name if ID provided
    let finalInstName = institutionName || '';
    if (institutionId && !finalInstName) {
      const inst = await Institution.findById(institutionId).select('name');
      if (inst) finalInstName = inst.name;
    }

    // Verify OTP if supplied
    const isVerified = (otpCode && verifyOtp(emailNormalized, otpCode)) || isEmailVerified(emailNormalized);

    const user = await User.create({
      name: name.trim(),
      email: emailNormalized,
      passwordHash,
      role: validRole,
      bureau: assignedBureau,
      region: assignedRegion,
      institutionId: institutionId || null,
      institutionName: finalInstName,
      rollOrEmployeeId: rollOrEmployeeId ? rollOrEmployeeId.trim() : '',
      department: department ? department.trim() : '',
      isEmailVerified: Boolean(isVerified),
      isActive: true
    });

    const token = generateToken(user);

    await logAuditEvent({
      actor: user,
      action: 'REGISTER',
      resourceType: 'User',
      resourceId: user._id,
      ipAddress: req.ip
    });

    return sendSuccess(res, 'Registration successful. Welcome to the Complaint Portal.', {
      token,
      user: user.toJSON()
    }, 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide both email and password.', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return sendError(res, 'Invalid email or password credentials.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'User account is deactivated. Contact administrator.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password credentials.', 401);
    }

    const token = generateToken(user);

    await logAuditEvent({
      actor: user,
      action: 'LOGIN',
      resourceType: 'User',
      resourceId: user._id,
      ipAddress: req.ip
    });

    return sendSuccess(res, 'Authentication successful.', {
      token,
      user: user.toJSON()
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    return sendSuccess(res, 'Current user profile loaded.', {
      user: req.user
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    if (req.user) {
      await logAuditEvent({
        actor: req.user,
        action: 'LOGOUT',
        resourceType: 'User',
        resourceId: req.user._id,
        ipAddress: req.ip
      });
    }
    return sendSuccess(res, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
}
