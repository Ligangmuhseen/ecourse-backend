// routes/chapterRoutes.js
import express from 'express';
import {
  createChapter,
  editChapter,
  deleteChapter,
  getChapter,
  getAllChapters,
  getCourseChaptersWithVideos
} from '../controllers/admin/chapterCrudeController.js';


import { protect } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/adminMiddleware.js';


const router = express.Router();

// Define routes for chapter management
router.post('/chapters/',protect,isAdmin, createChapter); // Create chapter
router.put('/chapters/:id',protect,isAdmin, editChapter); // Edit chapter
router.delete('/chapters/:id',protect,isAdmin, deleteChapter); // Delete chapter
router.get('/chapters/:id',protect,isAdmin, getChapter); // Retrieve chapter
router.get('/chapters/',protect,isAdmin, getAllChapters); // Get all chapters
router.get('/course/:courseId/chapters-with-videos',protect, getCourseChaptersWithVideos); 

export default router;
