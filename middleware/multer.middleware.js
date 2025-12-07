// middlewares/uploadMiddleware.js
import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file limit
  },
  fileFilter: (req, file, cb) => {
    // Optional: Restrict file types
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only CSV files are allowed'), false);
    }
    cb(null, true);
  },
});

export const uploadSingleFile = (fieldName) => upload.single(fieldName);
export const uploadMultipleFiles = (fieldName, maxCount = 10) => upload.array(fieldName, maxCount);