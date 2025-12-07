import express from "express";
import {
  createNewSymptom,
  getSymptoms,
  getSymptom,
  updateSymptomById,
  deleteSymptomById,
  uploadSymptoms
} from "../controllers/symptoms.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { uploadSingleFile } from "../middleware/multer.middleware.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

// 📥 GET all symptoms
router.get(
  '/',
  authorizePermission(MODULES.SYMPTOMS, EVENT_TYPES.READ),
  paginationCollector(),
  getSymptoms
);

// 📘 GET one symptom
router.get(
  '/:id',
  authorizePermission(MODULES.SYMPTOMS, EVENT_TYPES.READ),
  getSymptom
);

// ➕ POST create symptom
router.post(
  '/',
  authorizePermission(MODULES.SYMPTOMS, EVENT_TYPES.CREATE),
  createNewSymptom
);

// 🔄 PUT update symptom
router.put(
  '/:id',
  authorizePermission(MODULES.SYMPTOMS, EVENT_TYPES.UPDATE),
  updateSymptomById
);

// 🗑️ DELETE symptom
router.delete(
  '/:id',
  authorizePermission(MODULES.SYMPTOMS, EVENT_TYPES.DELETE),
  deleteSymptomById
);

// 📦 POST import symptoms from file
router.post(
  '/import',
  authorizePermission(MODULES.SYMPTOMS, EVENT_TYPES.CREATE),
  uploadSingleFile('file'),
  uploadSymptoms
);

export default router;