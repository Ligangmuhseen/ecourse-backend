// models/Chapter.js
import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    
  },
  description: {
    type: String,
    required: true,
  },
  coursename: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Course model
    ref: 'Course',
    required: true,
  },
});

const Chapter = mongoose.model('Chapter', chapterSchema);

export default Chapter;
