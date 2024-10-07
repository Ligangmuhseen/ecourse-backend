// routes/videoRoutes.js
import express from 'express';
import multer from 'multer';
import {
  addVideo,
  editVideo,
  getAllVideos,
  getVideosByChapter,
  deleteVideo,
  getVideoById,
} from '../controllers/admin/videoCrudeController.js';


const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Use multer for handling video file uploads

// Add video and upload to Vimeo
router.post('/video/', upload.single('video'), addVideo);

// Edit video details
router.put('/video/:id',upload.single('video'), editVideo);

// Get all videos
router.get('/video/', getAllVideos); 

// Get video by id
router.get('/video/:id', getVideoById);

// Get videos by chapter
router.get('/chapter/:chapterId', getVideosByChapter);

// Delete video
router.delete('/video/:id', deleteVideo);

export default router;
