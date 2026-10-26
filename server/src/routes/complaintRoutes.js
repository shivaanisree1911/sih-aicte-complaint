import { Router } from 'express';
import {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  assignComplaint,
  transferComplaint,
  updateComplaintStatus,
  escalateComplaint,
  addRemark,
  getComplaintHistory,
  uploadDocument,
  downloadDocument,
  sendPublicOtp,
  verifyPublicOtp,
  submitPublicComplaint,
  trackPublicComplaint
} from '../controllers/complaintController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/upload.js';
import { ROLES } from '../config/roles.js';

const router = Router();

// Public Grievance Portal Routes (Accessible to Students & Teachers without login)
router.post('/public/send-otp', sendPublicOtp);
router.post('/public/verify-otp', verifyPublicOtp);
router.post('/public', submitPublicComplaint);
router.get('/public/track/:caseId', trackPublicComplaint);

// Authenticated Officer & Internal Routes
router.use(authenticate);

router.get('/', getComplaints);
router.post(
  '/',
  authorizeRoles(
    ROLES.SUPER_ADMIN,
    ROLES.BUREAU_OFFICER,
    ROLES.REGIONAL_OFFICER,
    ROLES.STUDENT,
    ROLES.FACULTY,
    ROLES.PRINCIPAL
  ),
  createComplaint
);

router.get('/:id', getComplaintById);
router.patch(
  '/:id',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT, ROLES.BUREAU_OFFICER),
  updateComplaint
);

router.patch(
  '/:id/assign',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT, ROLES.BUREAU_OFFICER),
  assignComplaint
);

router.patch(
  '/:id/transfer',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT, ROLES.BUREAU_OFFICER),
  transferComplaint
);

router.patch(
  '/:id/status',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT, ROLES.BUREAU_OFFICER),
  updateComplaintStatus
);

router.post(
  '/:id/escalate',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT, ROLES.BUREAU_OFFICER, ROLES.REGIONAL_OFFICER),
  escalateComplaint
);

router.post(
  '/:id/remarks',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT, ROLES.BUREAU_OFFICER, ROLES.REGIONAL_OFFICER),
  addRemark
);

router.get('/:id/history', getComplaintHistory);

router.post(
  '/:id/documents',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT, ROLES.BUREAU_OFFICER, ROLES.REGIONAL_OFFICER),
  upload.single('document'),
  uploadDocument
);

router.get('/:id/documents/:docId', downloadDocument);

export default router;
