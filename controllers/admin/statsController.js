import Course from "../../models/courseModel.js";
import Enrollment from "../../models/enrollmentModel.js";
import User from "../../models/userModel.js";
import Video from "../../models/videoModel.js";
import VideoProgress from "../../models/videoProgressModel.js";

// Controller function to get counts
export const getCounts = async (req, res) => {
  try {
    const userCount = await User.countDocuments(); // Count all users
    const videoCount = await Video.countDocuments(); // Count all videos
    const courseCount = await Course.countDocuments(); // Count all courses

    // Respond with counts
    res.status(200).json({
      userCount,
      videoCount,
      courseCount,
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getEnrollmentData = async (req, res) => {
  try {
    // Aggregate the enrollments by month and count
    const enrollmentData = await Enrollment.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$enrollDate" },
            year: { $year: "$enrollDate" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Transform data into format usable for the chart
    const result = {
      months: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      enrollments: new Array(12).fill(0),
    };

    // Populate enrollment data
    enrollmentData.forEach((item) => {
      result.enrollments[item._id.month - 1] = item.count; // `month` is 1-indexed
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching enrollment data:", error);
    res.status(500).json({ error: "Failed to fetch enrollment data" });
  }
};

// Get counts: completed videos, enrolled courses, and total available courses
export const getUserStatsCounts = async (req, res) => {
  try {
    const userId = req.user._id; // Get the logged-in user's ID

    // 1. Count all completed videos for the user
    const completedVideosCount = await VideoProgress.countDocuments({
      user: userId,
      isCompleted: true,
    });

    // 2. Count all courses the user has enrolled in
    const enrolledCoursesCount = await Enrollment.countDocuments({
      user: userId,
    });

    // 3. Count total available courses
    const totalAvailableCoursesCount = await Course.countDocuments({
      isAvailable: true,
    });

    // Respond with the counts
    res.status(200).json({
      completedVideosCount, // Count of completed videos
      enrolledCoursesCount, // Count of enrolled courses
      totalAvailableCoursesCount, // Total count of available courses
    });
  } catch (error) {
    console.error("Error fetching user statistics counts:", error);
    res.status(500).json({
      message: "Failed to fetch user statistics counts",
      error: error.message,
    });
  }
};
