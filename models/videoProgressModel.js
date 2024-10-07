// models/VideoProgress.js
import mongoose from 'mongoose';

const videoProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video', // Reference to the Video model
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completionDate: {
    type: Date,
    default: null, // Set this when the user completes the video
  },
}, { timestamps: true });

// Create a unique index to prevent multiple records for the same user and video
videoProgressSchema.index({ user: 1, video: 1 }, { unique: true });

// Export the VideoProgress model
const VideoProgress = mongoose.model('VideoProgress', videoProgressSchema);

export default VideoProgress;
