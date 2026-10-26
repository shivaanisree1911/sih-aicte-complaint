import { sendError } from '../utils/response.js';

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Unauthenticated user.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access Forbidden: Role '${req.user.role}' lacks permission for this action.`,
        403
      );
    }

    next();
  };
}
