// utils/vimeoHelper.js
import dotenv from 'dotenv';
import { Vimeo } from '@vimeo/vimeo';

dotenv.config();

const client = new Vimeo(process.env.VIMEO_CLIENT_ID, process.env.VIMEO_CLIENT_SECRET, process.env.VIMEO_ACCESS_TOKEN);

export const uploadToVimeo = (filePath, title, description, onProgress) => {
  return new Promise((resolve, reject) => {
    client.upload(
      filePath,
      { name: title, description },
      function (uri) {
        resolve(uri); // Vimeo URL
      },
      function (bytesUploaded, bytesTotal) {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        onProgress(percentage); // Call the progress callback
      },
      function (error) {
        reject(error);
      }
    );
  });
};

export default client;
