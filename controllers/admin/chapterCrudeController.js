// controllers/ChapterController.js

import Chapter from "../../models/chapterModel.js";
import Course from "../../models/courseModel.js";
import Video from "../../models/videoModel.js";




// Create a new chapter
export const createChapter = async (req, res) => {
    const { title, description, coursename } = req.body;
  
    try {
      // Check if the chapter title already exists for the given course
      const existingChapter = await Chapter.findOne({ 
        title,
        coursename, // Check against the course
      });
      if (existingChapter) {
        return res.status(400).json({ message: 'Chapter title must be unique for the selected course' });
      }
  
      const newChapter = new Chapter({
        title,
        description,
        coursename,
      });
      await newChapter.save();
      res.status(201).json({ message: 'Chapter created successfully', chapter: newChapter });
    } catch (error) {
      res.status(400).json({ message: 'Failed to create chapter', error: error.message });
    }
  };
  
  // Edit an existing chapter
  export const editChapter = async (req, res) => {
    const { id } = req.params;
    const { title, description, coursename } = req.body;
  
    try {
      // Check if the chapter title is unique for the given course
      const existingChapter = await Chapter.findOne({ 
        title,
        coursename, // Check against the course
        _id: { $ne: id } // Exclude the current chapter from the check
      });
      if (existingChapter) {
        return res.status(400).json({ message: 'Chapter title must be unique for the selected course' });
      }
  
      const updatedChapter = await Chapter.findByIdAndUpdate(
        id,
        { title, description, coursename },
        { new: true } // Return the updated document
      );
  
      if (!updatedChapter) {
        return res.status(404).json({ message: 'Chapter not found' });
      }
  
      res.status(200).json({ message: 'Chapter updated successfully', chapter: updatedChapter });
    } catch (error) {
      res.status(400).json({ message: 'Failed to update chapter', error: error.message });
    }
  };
  
// Delete a chapter
export const deleteChapter = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedChapter = await Chapter.findByIdAndDelete(id);

    if (!deletedChapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    res.status(200).json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete chapter', error: error.message });
  }
};

// Retrieve a specific chapter
export const getChapter = async (req, res) => {
  const { id } = req.params;

  try {
    const chapter = await Chapter.findById(id).populate('coursename');

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    res.status(200).json({ chapter });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve chapter', error: error.message });
  }
};

// Get all chapters or chapters filtered by courseId
export const getAllChapters = async (req, res) => {
  try {
    // Check if courseId is provided in the query parameters
    const { courseId } = req.query;

    // Build the query object
    const query = courseId ? { coursename: courseId } : {};

    // Fetch chapters based on the query, populate the coursename field
    const chapters = await Chapter.find(query)
      .populate('coursename') // Adjust 'coursename' as per your schema
      .exec();

    res.status(200).json(chapters);
  } catch (error) {
    console.error("Error retrieving chapters:", error);
    res.status(500).json({ message: 'Failed to retrieve chapters', error: error.message });
  }
};


// Controller to get all chapters with their associated videos for a specific course
export const getCourseChaptersWithVideos = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Find the course by its ID
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Find all chapters for the given course
    const chapters = await Chapter.find({ coursename: courseId });

    // For each chapter, find its videos
    const chaptersWithVideos = await Promise.all(
      chapters.map(async (chapter) => {
        const videos = await Video.find({ chapter: chapter._id });
        return {
          ...chapter._doc, // Spread the chapter data
          videos,          // Attach the videos to the chapter
        };
      })
    );

    // Return the course details along with chapters and videos
    res.json({
      coursetitle: course.coursetitle,
      description: course.description,
      chapters: chaptersWithVideos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};