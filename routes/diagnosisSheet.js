import {
  createDiagnosisSheetController,
  getAllDiagnosisSheetController,
  getDiagnosisSheetByIdController,
  updateDiagnosisSheetController,
  deleteDiagnosisSheetController,
  getDiagnosisSheetByCaseController
} from "../controllers/diagnosisSheetController.js";

import express from "express";
const router = express.Router();

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { dynamicFilterMiddleware } from "../middleware/dynamicFilterMiddleware.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

// 🔐 Apply authentication to all routes
router.use(authenticate);

router.get("/case",
  authorizePermission(MODULES.DIAGNOSIS_SHEET, EVENT_TYPES.READ),
  paginationCollector(),
  getDiagnosisSheetByCaseController)
// 📄 Get all diagnosis sheets
router.get(
  '/',
  authorizePermission(MODULES.DIAGNOSIS_SHEET, EVENT_TYPES.READ),
  paginationCollector(),
  dynamicFilterMiddleware,
  getAllDiagnosisSheetController
);

// 🔍 Get diagnosis sheet by ID
router.get(
  '/:id',
  authorizePermission(MODULES.DIAGNOSIS_SHEET, EVENT_TYPES.READ),
  getDiagnosisSheetByIdController
);

// ➕ Create a new diagnosis sheet
router.post(
  '/',
  authorizePermission(MODULES.DIAGNOSIS_SHEET, EVENT_TYPES.CREATE),
  createDiagnosisSheetController
);

// ✏️ Update diagnosis sheet
router.put(
  '/:id',
  authorizePermission(MODULES.DIAGNOSIS_SHEET, EVENT_TYPES.UPDATE),
  updateDiagnosisSheetController
);

// ❌ Delete diagnosis sheet
router.delete(
  '/:id',
  authorizePermission(MODULES.DIAGNOSIS_SHEET, EVENT_TYPES.DELETE),
  deleteDiagnosisSheetController
);

export default router;
