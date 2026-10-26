import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

export async function getUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search, role, bureau } = req.query;
    const query = {};

    if (role && role !== 'All') {
      query.role = role;
    }

    if (bureau && bureau !== 'All') {
      query.bureau = bureau;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query)
    ]);

    return sendPaginated(res, 'Users retrieved successfully.', users, {
      total,
      page,
      limit
    });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, password, role, bureau, region } = req.body;

    if (!name || !email || !password || !role) {
      return sendError(res, 'Name, email, password, and role are required.', 400);
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return sendError(res, 'User with this email already exists.', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      bureau: bureau || 'All',
      region: region || 'All',
      isActive: true
    });

    await logAuditEvent({
      actor: req.user,
      action: 'CREATE_USER',
      resourceType: 'User',
      resourceId: user._id,
      metadata: { email: user.email, role: user.role },
      ipAddress: req.ip
    });

    return sendSuccess(res, 'User account created successfully.', { user: user.toJSON() }, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    const updatable = ['name', 'role', 'bureau', 'region', 'isActive'];
    updatable.forEach(f => {
      if (req.body[f] !== undefined) {
        user[f] = req.body[f];
      }
    });

    if (req.body.password && req.body.password.trim()) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(req.body.password.trim(), salt);
    }

    await user.save();

    await logAuditEvent({
      actor: req.user,
      action: 'UPDATE_USER',
      resourceType: 'User',
      resourceId: user._id,
      metadata: { targetUser: user.email, changes: req.body },
      ipAddress: req.ip
    });

    return sendSuccess(res, 'User account updated successfully.', { user: user.toJSON() });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const { action, resourceType, search } = req.query;
    const query = {};

    if (action && action !== 'All') {
      query.action = action;
    }

    if (resourceType && resourceType !== 'All') {
      query.resourceType = resourceType;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { actorName: regex },
        { actorEmail: regex },
        { resourceId: regex },
        { action: regex }
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query)
    ]);

    return sendPaginated(res, 'Audit logs retrieved.', logs, {
      total,
      page,
      limit
    });
  } catch (err) {
    next(err);
  }
}
