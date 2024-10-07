// models/Video.js
import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
   vimeovideourl: {
    type: String,
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter', // Reference to the Chapter model
    required: true,
  },
 
},{ timestamps: true });

const Video = mongoose.model('Video', videoSchema);

export default Video;
