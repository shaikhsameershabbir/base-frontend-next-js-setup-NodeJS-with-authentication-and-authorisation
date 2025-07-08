// uploadMiddleware.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getUserId } from '../utils/getUserIdFromJwt'; // Ensure this is imported

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = getUserId(req); // Get userId from the request
    if (!userId) {
      return cb(new Error("User ID not found"), ''); // Pass an error if userId is not found
    }

    const userDir = path.join(__dirname, '..', '..', 'public', 'uploads', userId); // Update path as needed

    // Create the directory if it doesn't exist
    fs.mkdir(userDir, { recursive: true }, (err) => {
      if (err) {
        console.error('Error creating directory:', err);
        return cb(err, ''); // Pass the error to multer, but provide an empty string for the destination
      }
      cb(null, userDir); // Use the user directory for the upload
    });
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`); // Use the original file name or modify as needed
  },
});

// Export the multer instance
export const upload = multer({ storage });
