// models/Enrollment.js
import mongoose from "mongoose";

// Create a schema for the Enrollment model
const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course', // Reference to the Course model
    required: true,
  },
  isEnroll: {
    type: Boolean,
    default: true, // Assuming a default value of true
  },
  enrollDate: {
    type: Date,
    default: Date.now, // Default to the current date
  },
});

// Create the Enrollment model
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
