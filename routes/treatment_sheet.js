import express from "express";
import {
  createTreatmentSheetController,
  deleteTreatmentSheetController,
  getAllTreatmentSheetsController,
  getTreatmentSheetByCaseController,
  getTreatmentSheetByIdController,
  updateTreatmentSheetController,
} from "../controllers/treatment_sheet.js";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { EVENT_TYPES, MODULES } from "../constants/auth.js";
const router = express.Router();

router.use(authenticate);

router.get(
  "/case",
  authorizePermission(MODULES.TREATMENT_SHEET, EVENT_TYPES.READ),
  getTreatmentSheetByCaseController
);

router.get(
  "/",
  authorizePermission(MODULES.TREATMENT_SHEET, EVENT_TYPES.READ),
  paginationCollector(),
  getAllTreatmentSheetsController
);

router.post(
  "/",
  authorizePermission(MODULES.TREATMENT_SHEET, EVENT_TYPES.CREATE),
  createTreatmentSheetController
);

router.get(
  "/:id",
  authorizePermission(MODULES.TREATMENT_SHEET, EVENT_TYPES.READ),
  getTreatmentSheetByIdController
);

router.put(
  "/:id",
  authorizePermission(MODULES.TREATMENT_SHEET, EVENT_TYPES.UPDATE),
  updateTreatmentSheetController
);

router.delete(
  "/:id",
  authorizePermission(MODULES.TREATMENT_SHEET, EVENT_TYPES.DELETE),
  deleteTreatmentSheetController
);

export default router;
