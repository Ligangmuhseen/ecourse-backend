import Course from "../../models/courseModel.js";
import Enrollment from "../../models/enrollmentModel.js";


export const enrollUserInCourse = async (req, res) => {
    const userId = req.user._id; // Get logged-in user's ID
    const { courseId } = req.body; // Get courseId from the request body
  
    try {
      // Check if the course exists and is available
      const course = await Course.findById(courseId);
      if (!course || !course.isAvailable) {
        return res.status(404).json({ message: 'Course not found or unavailable' });
      }
  
      // Check if the user is already enrolled in the course
      const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
      if (existingEnrollment) {
        return res.status(400).json({ message: 'User is already enrolled in this course' });
      }
  
      // Create a new enrollment
      const enrollment = new Enrollment({
        user: userId,
        course: courseId,
        isEnroll: true,
        enrollDate: Date.now(),
      });
  
      await enrollment.save();
      res.status(201).json({ message: 'User enrolled successfully', enrollment });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error enrolling user', error });
    }
  };

// all enrollments of loggin user
export const getUserEnrollments = async (req, res) => {
    const userId = req.user._id; // Get logged-in user's ID
  
    try {
      // Find all enrollments for the logged-in user and populate the course details
      const enrollments = await Enrollment.find({ user: userId })
        .populate('course') // Specify the fields to return from the course
        .exec();
  
      const count = enrollments.length; // Get the count of enrollments
  
      res.status(200).json({ count, enrollments });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching enrollments', error });
    }
  };


  // check enrollment

export const checkEnrollmentStatus = async (req, res) => {
    const userId = req.user._id; // Get the logged-in user's ID
    const { courseId } = req.params; // Get course ID from the request parameters
  
    try {
      // Check if the user is enrolled in the course
      const enrollment = await Enrollment.findOne({
        user: userId,
        course: courseId,
        isEnroll: true,
      });
  
      if (enrollment) {
        return res.status(200).json({ enrolled: true });
      } else {
        return res.status(200).json({ enrolled: false });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error checking enrollment status', error });
    }
  };


//   get enrollment details by id
 export const getEnrollmentById = async (req, res) => {
    const { id } = req.params;
  
    try {
      // Find the enrollment by ID and populate the course details
      const enrollment = await Enrollment.findById(id).populate('course');
  
      if (!enrollment) {
        return res.status(404).json({ message: 'Enrollment not found' });
      }
  
      // Return the enrollment with the populated course details
      res.status(200).json(enrollment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }; 
  
  
// Return all enrollments or enrollments filtered by courseId
export const getAllEnrollments = async (req, res) => {
    try {
      // Check if courseId is provided in the query parameters
      const { courseId } = req.query;
  
      // Build the query object
      const query = courseId ? { course: courseId } : {};
  
      // Fetch enrollments based on the query, populate course and user fields
      const enrollments = await Enrollment.find(query)
        .populate('course') // Adjust 'course' as per your schema
        .populate('user')   // Adjust 'user' as per your schema
        .exec();
  
      res.status(200).json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ error: "Failed to fetch enrollments" });
    }
  };
  

  
  
  
