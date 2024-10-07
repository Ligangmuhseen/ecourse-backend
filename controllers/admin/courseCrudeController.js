// controllers/courseController.js
import Course from "../../models/courseModel.js";

// createCourse
export const createCourse = async (req, res) => {
  const { coursetitle, description } = req.body;
  const courseimage = req.file ? req.file.path : null; // Get the path of the uploaded image



  try {
    const newCourse = new Course({
      coursetitle,
      description,
      coverimage: courseimage, // Save the image path to the database
    });

    await newCourse.save();
    res
      .status(201)
      .json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Course title must be unique" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

//updatecourse

export const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { coursetitle, description, isAvailable } = req.body;
  const courseimage = req.file ? req.file.path : null; // Get the path of the uploaded image

  try {
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Update fields
    course.coursetitle = coursetitle || course.coursetitle;
    course.description = description || course.description;
    course.isAvailable =
      isAvailable !== undefined ? isAvailable : course.isAvailable;
    course.coverimage = courseimage || course.coverimage; // Only update if a new image is provided

    await course.save();
    res.status(200).json({ message: "Course updated successfully", course });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Course title must be unique" });
    }
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get all courses or only available courses if isAvailable is provided
export const getAllCourses = async (req, res) => {
  const { isAvailable } = req.query; // Extract isAvailable from query parameters

  try {
    // If isAvailable is provided, filter by availability, else return all courses
    const filter = isAvailable ? { isAvailable: isAvailable === 'true' } : {};
    const courses = await Course.find(filter);

    res.status(200).json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get 6 latest courses
export const getLatestCourses = async (req, res) => {
  try {
    const latestCourses = await Course.find({isAvailable:true})
      .sort({ createdAt: -1 }) // Sort by creation date in descending order (newest first)
      .limit(6); // Limit the results to 6 courses

    res.status(200).json(latestCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// View a course by ID
export const getCourseById = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a course by ID
export const deleteCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Controller to fetch available courses by pagination
export const getAvailableCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const pageSize = 9; // 9 courses per page

    // Get the available courses from the database
    const courses = await Course.find({ isAvailable: true })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    // Get the total count of available courses
    const totalCourses = await Course.countDocuments({ isAvailable: true });
    const totalPages = Math.ceil(totalCourses / pageSize);

    // Determine the pagination range (show max 5 pages)
    const maxPagesToShow = 5;
    const startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    res.json({
      courses,
      totalPages,
      currentPage: page,
      pageSize,
      startPage,
      endPage,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses" });
  }
};