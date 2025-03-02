import express from 'express';
import { register } from '../controllers/sellerController.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ storage: storage });

// Handle multiple file uploads
const uploadFields = upload.fields([
  { name: 'governmentId', maxCount: 1 },
  { name: 'passport', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]);

// Register route with file upload
router.post('/register', uploadFields, register);

export default router; 