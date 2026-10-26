import { Router } from 'express';
import {
  getInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  getInstitutionComplaints,
  getPublicInstitutions
} from '../controllers/institutionController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/roles.js';

const router = Router();

// Public unauthenticated route for student/faculty complaint portal
router.get('/public-list', getPublicInstitutions);

router.use(authenticate);

router.get('/', getInstitutions);
router.post(
  '/',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT, ROLES.BUREAU_OFFICER, ROLES.REGIONAL_OFFICER),
  createInstitution
);

router.get('/:id', getInstitutionById);
router.patch(
  '/:id',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT, ROLES.BUREAU_OFFICER),
  updateInstitution
);

router.get('/:id/complaints', getInstitutionComplaints);

export default router;
