import { Router } from "express";
import { uploadLogoS3 } from "../constants/S3config.js";
import { 
  uploadLogo, 
  getLogoFile, 
  getLogoMeta, 
  resetToDefaultLogoController,
  updateLogoShape,
  uploadDefaultLogo
} from "../controllers/logoController.js";

const router = Router();

// POST /v1/logo - Upload logo to S3
router.post("/", uploadLogoS3.single('logo'), uploadLogo);

// GET /v1/logo - Redirect to S3 logo URL
router.get("/", getLogoFile);

// GET /v1/logo/meta - Get logo metadata
router.get("/meta", getLogoMeta);

// DELETE /v1/logo/reset - Reset to default logo
router.delete('/reset', resetToDefaultLogoController);

// PATCH /v1/logo/shape - Update logo shape
router.patch('/shape', updateLogoShape);

// routes/logo.js - ADD THIS ROUTE
// POST /v1/logo/default - Upload default logo to S3
router.post("/default", uploadLogoS3.single('logo'), uploadDefaultLogo);


export default router;
