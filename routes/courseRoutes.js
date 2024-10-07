// routes/courseRoutes.js
import express from "express";
import {
  createCourse,
  updateCourse,
  getCourseById,
  deleteCourse,
  getAllCourses,
  getLatestCourses,
  getAvailableCourses,
} from "../controllers/admin/courseCrudeController.js";
import { uploadCourseImage } from "../middlewares/upload.js";
import { protect } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

// Create a new course with an image upload
router.post(
  "/courses",
  protect,
  isAdmin,
  uploadCourseImage.single("coverimage"),
  createCourse
);

// Update a course with an image upload
router.put(
  "/courses/:id",
  protect,
  isAdmin,
  uploadCourseImage.single("coverimage"),
  updateCourse
);

// View a course by ID
router.get("/courses/:id", getCourseById);

// View a course by ID
router.get("/latest/courses",  getLatestCourses);

// Get all courses
router.get("/courses", getAllCourses);

router.get("/courses/available/paginated",getAvailableCourses)

// Delete a course by ID
router.delete("/courses/:id", protect, isAdmin, deleteCourse);

export default router;
