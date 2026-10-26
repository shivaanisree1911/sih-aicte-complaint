import { Router } from 'express';
import {
  getOverlaps,
  getOverlapById,
  reviewOverlap,
  linkCases,
  resolveOverlap,
  dismissOverlap,
  scanAllInstitutions
} from '../controllers/overlapController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.use(authenticate);

router.get('/', getOverlaps);
router.post('/scan', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT), scanAllInstitutions);
router.get('/:id', getOverlapById);

router.post(
  '/:id/review',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT, ROLES.BUREAU_OFFICER),
  reviewOverlap
);

router.post(
  '/:id/link-cases',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT, ROLES.BUREAU_OFFICER),
  linkCases
);

router.post(
  '/:id/resolve',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT, ROLES.BUREAU_OFFICER),
  resolveOverlap
);

router.post(
  '/:id/dismiss',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT, ROLES.BUREAU_OFFICER),
  dismissOverlap
);

export default router;
