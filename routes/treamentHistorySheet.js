import {
  createTreatmentHistorySheetController,
  getAllTreatmentHistorySheetsController,
  getTreatmentHistorySheetByIdController,
  updateTreatmentHistorySheetController,
  deleteTreatmentHistorySheetController,
  getTreatmentHistorySheetByCaseController,
} from "../controllers/TreatmentHistorySheet.js";

import express from "express";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// Authenticate all routes
router.use(authenticate);

router.get(
  "/case",
  authorizePermission(MODULES.TREATMENT_HISTORY_SHEET, EVENT_TYPES.READ),
  getTreatmentHistorySheetByCaseController
);

// GET all treatment history sheets
router.get(
  "/",
  authorizePermission(MODULES.TREATMENT_HISTORY_SHEET, EVENT_TYPES.READ),
  getAllTreatmentHistorySheetsController
);

// GET treatment history by ID
router.get(
  "/:id",
  authorizePermission(MODULES.TREATMENT_HISTORY_SHEET, EVENT_TYPES.READ),
  getTreatmentHistorySheetByIdController
);

// POST new treatment history
router.post(
  "/",
  authorizePermission(MODULES.TREATMENT_HISTORY_SHEET, EVENT_TYPES.CREATE),
  createTreatmentHistorySheetController
);

// PUT update treatment history
router.put(
  "/:id",
  authorizePermission(MODULES.TREATMENT_HISTORY_SHEET, EVENT_TYPES.UPDATE),
  updateTreatmentHistorySheetController
);

// DELETE treatment history
router.delete(
  "/:id",
  authorizePermission(MODULES.TREATMENT_HISTORY_SHEET, EVENT_TYPES.DELETE),
  deleteTreatmentHistorySheetController
);

export default router;
