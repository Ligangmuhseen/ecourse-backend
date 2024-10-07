// models/Course.js
import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  coursetitle: {
    type: String,
    required: true,
    unique: true, // Ensure the title is unique
  },
  description: {
    type: String,
    required: true,
  },
  coverimage: {
    type: String, // You can change this to Buffer if you're storing images directly
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true, // Set a default value for availability
  },
},{ timestamps: true });

const Course = mongoose.model('Course', courseSchema);

export default Course;
