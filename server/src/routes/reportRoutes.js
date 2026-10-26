import { Router } from 'express';
import {
  getBureauReport,
  getRegionReport,
  getInstitutionReport,
  getStatusReport,
  getOverdueReport,
  getOverlapReport,
  getOfficerWorkloadReport,
  exportReportCSV
} from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/bureau', getBureauReport);
router.get('/region', getRegionReport);
router.get('/institution', getInstitutionReport);
router.get('/status', getStatusReport);
router.get('/overdue', getOverdueReport);
router.get('/overlaps', getOverlapReport);
router.get('/officer-workload', getOfficerWorkloadReport);
router.get('/export.csv', exportReportCSV);

export default router;
