// controllers/videoController.js
import Video from "../../models/videoModel.js";
import { uploadToVimeo } from "../../utils/vimeoHelper.js";
import client from "../../utils/vimeoHelper.js";
import axios from "axios";
import fs from "fs"; // To handle file reading for upload
import { broadcastProgress } from '../../utils/websocket.js'; 
import Chapter from "../../models/chapterModel.js";



// Add a new video and upload to Vimeo
export const addVideo = async (req, res) => {
  const { title, description, chapterId } = req.body;
  const videoFile = req.file; // Assuming Multer is used for handling file uploads

  if (!videoFile) {
    return res.status(400).json({ message: "Video file is required" });
  }

  try {
        // Upload video to Vimeo with progress
        const vimeoUrl = await uploadToVimeo(videoFile.path, title, description, (percentage) => {
          // Emit progress to WebSocket clients
          broadcastProgress(percentage);
        });
    

    // Extract Vimeo video ID from the returned Vimeo URL
    const vimeoId = vimeoUrl.split("/").pop(); // Extract only the video ID (e.g., 1014880572)
    const formattedVimeoUrl = `https://vimeo.com/${vimeoId}`; // Construct correct Vimeo URL format

    // Save video metadata (including correctly formatted Vimeo URL) in your database
    const newVideo = new Video({
      title,
      description,
      vimeovideourl: formattedVimeoUrl, // Use the correct URL format
      chapter: chapterId,
    });

    await newVideo.save();

    // Remove the uploaded file from the server if necessary
    // fs.unlinkSync(videoFile.path); // You can remove the file locally if it's no longer needed

    res
      .status(201)
      .json({ message: "Video uploaded successfully", video: newVideo });
  } catch (error) {
    console.error("Error uploading video:", error);
    res
      .status(500)
      .json({
        message: "Failed to upload video to Vimeo",
        error: error.message,
      });
  }
};



// Vimeo API configuration
const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const vimeoHeaders = {
  Authorization: `Bearer ${VIMEO_ACCESS_TOKEN}`,
  "Content-Type": "application/json",
  Accept: "application/vnd.vimeo.*+json;version=3.4",
};

// Edit an existing video (with metadata update and progress tracking)
export const editVideo = async (req, res) => {
  const { id } = req.params;
  const { title, description, chapterId } = req.body;
  const videoFile = req.file; // Assuming Multer is used for file uploads

  try {
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    let vimeoUrl = video.vimeovideourl; // Preserve the existing Vimeo URL if no new file
    let uploadProgress = 0; // Track upload progress

    // If updating with a new video file
    if (videoFile) {
      const createUrl = "https://api.vimeo.com/me/videos";
      const videoData = {
        upload: {
          approach: "tus",
          size: videoFile.size,
        },
        name: title,
        description: description,
      };

      // Step 1: Delete the old video from Vimeo
      if (video.vimeovideourl) {
        const videoId = video.vimeovideourl.split("/").pop();
        const deleteUrl = `https://api.vimeo.com/videos/${videoId}`;
        const deleteResponse = await axios.delete(deleteUrl, {
          headers: vimeoHeaders,
        });
        if (deleteResponse.status !== 204) {
          return res
            .status(400)
            .json({
              message: `Failed to delete old Vimeo video: ${
                deleteResponse.data.error || deleteResponse.statusText
              }`,
            });
        }
      }

      // Step 2: Create and upload new video
      const createResponse = await axios.post(createUrl, videoData, {
        headers: vimeoHeaders,
      });
      if (createResponse.status !== 200) {
        return res
          .status(400)
          .json({
            message: `Failed to create Vimeo video: ${
              createResponse.data.error || createResponse.statusText
            }`,
          });
      }

      const uploadLink = createResponse.data.upload.upload_link;
      const fileSize = fs.statSync(videoFile.path).size;
      let uploadOffset = 0;

      // Function to report progress
      const reportProgress = (uploadedBytes) => {
        const percentage = Math.floor((uploadedBytes / fileSize) * 100);
        uploadProgress = percentage;
        console.log(`Upload progress: ${percentage}%`);
        // Optionally, send progress to the client via WebSocket or some mechanism
          // Broadcast progress to WebSocket clients
          broadcastProgress(uploadProgress);
      };

      // Upload video in chunks with progress tracking
      while (uploadOffset < fileSize) {
        const chunkSize = Math.min(fileSize - uploadOffset, 512 * 1024 * 1024); // 512 MB chunk size
        const chunk = fs.createReadStream(videoFile.path, {
          start: uploadOffset,
          end: uploadOffset + chunkSize - 1,
        });

        const uploadResponse = await axios.patch(uploadLink, chunk, {
          headers: {
            "Tus-Resumable": "1.0.0",
            "Upload-Offset": uploadOffset,
            "Content-Type": "application/offset+octet-stream",
          },
          // This part captures the upload progress
          onUploadProgress: (progressEvent) => {
            reportProgress(progressEvent.loaded + uploadOffset);
          },
        });

        if (![200, 204].includes(uploadResponse.status)) {
          return res
            .status(400)
            .json({
              message: `Failed to upload video chunk: ${
                uploadResponse.data.error || uploadResponse.statusText
              }`,
            });
        }

        uploadOffset = parseInt(uploadResponse.headers["upload-offset"], 10);
      }

      // Verify the upload was successful
      const verifyResponse = await axios.head(uploadLink, {
        headers: {
          "Tus-Resumable": "1.0.0",
          Accept: "application/vnd.vimeo.*+json;version=3.4",
        },
      });

      if (
        verifyResponse.status !== 200 ||
        verifyResponse.headers["upload-length"] !== String(fileSize)
      ) {
        return res
          .status(400)
          .json({ message: "Failed to verify video upload" });
      }

      const videoUri = createResponse.data.uri;
      const videoResponse = await axios.get(
        `https://api.vimeo.com${videoUri}`,
        { headers: vimeoHeaders }
      );

      if (videoResponse.status !== 200) {
        return res
          .status(400)
          .json({ message: "Failed to get video details from Vimeo" });
      }

      vimeoUrl = videoResponse.data.link;
    } else {
      // If no new video is uploaded, update metadata on Vimeo
      const videoId = vimeoUrl.split("/").pop();
      const vimeoUpdateUrl = `https://api.vimeo.com/videos/${videoId}`;

      const updateData = {
        name: title,
        description: description,
      };

      const vimeoUpdateResponse = await axios.patch(
        vimeoUpdateUrl,
        updateData,
        { headers: vimeoHeaders }
      );
      if (vimeoUpdateResponse.status !== 200) {
        return res
          .status(400)
          .json({
            message: `Failed to update Vimeo metadata: ${
              vimeoUpdateResponse.data.error || vimeoUpdateResponse.statusText
            }`,
          });
      }
    }

    // Step 3: Update the video metadata in the database
    video.title = title;
    video.description = description;
    video.vimeovideourl = vimeoUrl; // Either the new or existing URL
    video.chapter = chapterId;

    await video.save();

    return res.status(200).json({
      message: "Video updated successfully",
      uploadProgress, // Return progress percentage
      video,
    });
  } catch (error) {
    console.error("Error during video update:", error.message);
    return res.status(400).json({
      message: "Failed to update video",
      error: error.message,
    });
  }
};

// Delete a video from Vimeo and remove it from the DB
export const deleteVideo = async (req, res) => {
  const { id } = req.params;

  try {
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check if the video has a Vimeo URL and extract the video ID
    if (video.vimeovideourl) {
      const videoId = video.vimeovideourl.split("/").pop();
      const deleteUrl = `/videos/${videoId}`;

      try {
        // Delete video from Vimeo
        const deleteResponse = await client.request({
          method: "DELETE",
          path: deleteUrl,
        });

        // Check if Vimeo responded with a successful status (204 No Content)
        if (deleteResponse.statusCode !== 204) {
          return res
            .status(500)
            .json({ message: "Failed to delete video from Vimeo" });
        }
      } catch (error) {
        return res
          .status(500)
          .json({
            message: "Failed to delete video from Vimeo",
            error: error.message,
          });
      }
    }

    // Delete video from the database
    await Video.findByIdAndDelete(id);

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete video", error: error.message });
  }
};

// Get all videos or videos filtered by courseId
export const getAllVideos = async (req, res) => {
  try {
    // Check if courseId is provided in the query parameters
    const { courseId } = req.query;

    // Build the query object
    let query = {};
    
    // If courseId is provided, adjust the query to filter videos by the associated course
    if (courseId) {
      query = {
        'chapter': { 
          $in: await Chapter.find({ coursename: courseId }).distinct('_id') // Get all chapter IDs associated with the courseId
        }
      };
    }

    // Fetch videos based on the query, populating chapter and coursename fields
    const videos = await Video.find(query).populate({
      path: "chapter", // Populate the chapter field
      populate: {
        path: "coursename", // Populate the coursename field from the Chapter model
      },
    });

    res.status(200).json(videos);
  } catch (error) {
    console.error("Error retrieving videos:", error);
    res.status(500).json({ message: "Failed to retrieve videos", error: error.message });
  }
};


// Get video by ID
export const getVideoById = async (req, res) => {
  const { id } = req.params; // Get the ID from the request parameters
  try {
    const video = await Video.findById(id).populate({
      path: "chapter", // Populate the chapter field
      populate: {
        path: "coursename", // Populate the coursename field from the Chapter model
        select: "coursetitle", // Select the coursetitle field from the Course model
      },
    });

    // Check if video exists
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json(video);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve video", error: error.message });
  }
};

// Get videos by chapter
export const getVideosByChapter = async (req, res) => {
  const { chapterId } = req.params;

  try {
    const videos = await Video.find({ chapter: chapterId }).populate("chapter");
    res.status(200).json(videos);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve videos", error: error.message });
  }
};
