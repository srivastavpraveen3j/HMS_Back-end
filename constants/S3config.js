// constants/S3config.js - UPDATED FOR CONSISTENT NAMING
import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "digitalks-crm-bucket";
const S3_FOLDER = process.env.S3_FOLDER || "HIMS";

// Enhanced multer S3 configuration
export const uploadLogoS3 = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      // Always use consistent naming for logo uploads
      const ext = path.extname(file.originalname).toLowerCase();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      
      // Create unique filename but consistent pattern
      const filename = `site-logo-${timestamp}-${randomId}${ext}`;
      const s3Key = `${S3_FOLDER}/logos/${filename}`;
      
      console.log('Generated S3 key for new logo:', s3Key);
      cb(null, s3Key);
    },
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
        purpose: 'site-logo'
      });
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only image files
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    
    if (allowedMimes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${allowedMimes.join(', ')}`), false);
    }
  }
});




export { s3Client, BUCKET_NAME, S3_FOLDER };
