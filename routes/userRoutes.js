import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  adminLogin,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadProfilePhoto } from "../middlewares/upload.js";
import {
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
} from "../controllers/admin/UserCrudeController.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

// User registration route
router.post("/register", registerUser);

// User login route
router.post("/login", loginUser);

// Admin login
router.post("/admin/login", adminLogin);

// Protect this route with the authMiddleware to ensure only logged-in users can access it
router.get("/profile", protect, getUserProfile);

// Route to update user profile
router.put(
  "/profile",
  protect,
  uploadProfilePhoto.single("profile_photo"),
  updateUserProfile
);

// Route to change password
router.post("/change-password", protect, changePassword);

// Create a new user (Admin only)
router.post("/users", protect, isAdmin, createUser);

// Update a user (Admin only)
router.put("/users/:id", protect, isAdmin, updateUser);

// Get all users (Admin only)
router.get("/users", protect, isAdmin, getAllUsers);

router.get("/users/:id", protect, isAdmin, getUserById);

export default router;
