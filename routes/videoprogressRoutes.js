// routes/videoProgressRoutes.js
import express from 'express';
import { getVideoCompletionStatus, markVideoAsCompleted } from '../controllers/admin/videoProgressController.js';
import { protect } from '../middlewares/authMiddleware.js';



const router = express.Router();

// Route to mark a video as completed for a specific user
router.put('/video/:videoId/complete',protect, markVideoAsCompleted);

router.get('/video/:videoId/completion-status', protect, getVideoCompletionStatus); // New route for fetching completion status

export default router;