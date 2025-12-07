import express from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { s3Client, BUCKET_NAME } from "../constants/S3config.js";
import { getConfig, saveConfig, uploadHeaderLogo } from "../controllers/headerConfigController.js";

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => cb(null, `letterhead-logos/${Date.now()}-${file.originalname}`)
  })
});

const router = express.Router();
// GET current config
router.get("/config", getConfig);

// PUT update config
router.put("/config", saveConfig);

// POST logo upload for letterhead header
router.post("/logo", upload.single("logo"), uploadHeaderLogo);

export default router;
