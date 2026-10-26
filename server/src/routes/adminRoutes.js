import { Router } from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  getAuditLogs
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.use(authenticate);

// Super Admin only for user management
router.get('/users', authorizeRoles(ROLES.SUPER_ADMIN), getUsers);
router.post('/users', authorizeRoles(ROLES.SUPER_ADMIN), createUser);
router.patch('/users/:id', authorizeRoles(ROLES.SUPER_ADMIN), updateUser);

// Super Admin, Senior Management, Auditor for audit logs
router.get(
  '/audit-logs',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT, ROLES.AUDITOR),
  getAuditLogs
);

export default router;
