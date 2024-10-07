// routes/stats.js
import express from 'express';
import { getCounts, getEnrollmentData, getUserStatsCounts } from '../controllers/admin/statsController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Define the route for getting counts
router.get('/admin/counts',protect,isAdmin, getCounts);
// get enrollment data
router.get('/enrollment-data',protect,isAdmin, getEnrollmentData);

router.get('/user/stats/counts',protect, getUserStatsCounts);


export default router;