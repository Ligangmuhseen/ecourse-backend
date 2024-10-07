import VideoProgress from "../../models/videoProgressModel.js";


// Controller to mark a video as completed for a user
export const markVideoAsCompleted = async (req, res) => {
    const userId = req.user._id; // Get the logged-in user's ID
    const {videoId} = req.params; // Get userId and videoId from request parameters
  
    try {
      // Find the existing VideoProgress document for the user and video
      let videoProgress = await VideoProgress.findOne({ user: userId, video: videoId });
  
      // If no existing progress, create a new one
      if (!videoProgress) {
        videoProgress = new VideoProgress({
          user: userId,
          video: videoId,
          isCompleted: true,
          completionDate: new Date(), // Set the current date as completion date
        });
        await videoProgress.save();
      } else {
        // If progress exists, update isCompleted and completionDate
        videoProgress.isCompleted = true;
        videoProgress.completionDate = new Date(); // Set to current date
        await videoProgress.save();
      }
  
      // Return the updated video progress
      return res.status(200).json({
        success: true,
        message: 'Video marked as completed',
        data: videoProgress,
      });
    } catch (error) {
      // Handle errors
      return res.status(500).json({
        success: false,
        message: 'Error marking video as completed',
        error: error.message,
      });
    }
  };


// fetch video completion status
  export const getVideoCompletionStatus = async (req, res) => {
    const { videoId } = req.params; // Extract videoId from the request parameters
    const userId = req.user.id; // Assume user ID is available on req.user after authentication
  
    try {
      const progress = await VideoProgress.findOne({ 
        video: videoId, 
        user: userId 
      });
  
      if (!progress) {
        return res.status(200).json({ is_completed: false });
      }
  
      return res.status(200).json({ is_completed: progress.isCompleted });
    } catch (error) {
      console.error("Error fetching video completion status:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };