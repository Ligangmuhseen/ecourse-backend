// routes/enrollmentRoutes.js
import express from 'express'
import { protect } from '../middlewares/authMiddleware.js';
import { enrollUserInCourse, getUserEnrollments,checkEnrollmentStatus,getEnrollmentById,getAllEnrollments } from '../controllers/admin/enrollmentCrudeController.js';




const router = express.Router();

// Route for enrolling a logged-in user in a course
router.post('/enroll', protect, enrollUserInCourse);

// Route for return  all enrollments of a logged-in user in a course
router.get('/userenrollments', protect, getUserEnrollments);

// Route to check if a user is enrolled in a course
router.get('/enrollment/check/:courseId', protect, checkEnrollmentStatus);

// Route to get enrollment by ID
router.get('/enrollment/:id',protect, getEnrollmentById);


// Route for return  specific enrollments if courseId else all enrollments
router.get('/alluserenrollments/', protect, getAllEnrollments);



export default router;
