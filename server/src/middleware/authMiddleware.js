import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { sendError } from '../utils/response.js';

export async function authenticate(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Authentication required. No authorization token provided.', 401);
    }

    const secret = process.env.JWT_SECRET || 'aicte_central_sentinel_auth_key_2026_production_vault';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return sendError(res, 'User session invalid or user no longer exists.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'User account is deactivated. Contact administrator.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Session token has expired. Please log in again.', 401);
    }
    return sendError(res, 'Invalid authorization token.', 401);
  }
}
