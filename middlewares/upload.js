import multer from 'multer';
import path from 'path';

// Set up multer storage for profile photos
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'media/profile_photos/'); // Destination folder for profile photos
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Unique file name
  }
});

// Set up multer storage for course images
const courseStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'media/course_images/'); // Destination folder for course images
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Unique file name
  }
});

// File filter to allow only image uploads
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images only!');
  }
};

// Set up multer upload for profile photos
const uploadProfilePhoto = multer({
  storage: profileStorage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
  fileFilter: fileFilter
});

// Set up multer upload for course images
const uploadCourseImage = multer({
  storage: courseStorage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB

});

export { uploadProfilePhoto, uploadCourseImage };
