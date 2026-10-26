import { Router } from 'express';
import {
  getDashboardSummary,
  getDashboardTrends,
  getBureauWorkload,
  getRegionDistribution,
  getAgeingAnalysis,
  getRecentActivity
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/summary', getDashboardSummary);
router.get('/trends', getDashboardTrends);
router.get('/bureau-workload', getBureauWorkload);
router.get('/region-distribution', getRegionDistribution);
router.get('/ageing', getAgeingAnalysis);
router.get('/recent-activity', getRecentActivity);

export default router;
