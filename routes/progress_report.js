import express from "express";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { EVENT_TYPES, MODULES } from "../constants/auth.js";
import { createProgressReportController, deleteProgressReportController, getAllProgressReportController, getProgressReportByCaseController, getProgressReportByIdController, updateProgressReportController } from "../controllers/progress_report.js";
const router = express.Router();

router.use(authenticate);

router.get(
  "/case",
  authorizePermission(MODULES.DAILY_PROGRESS_REPORT, EVENT_TYPES.READ),
  getProgressReportByCaseController
);

router.get(
  "/",
  authorizePermission(MODULES.DAILY_PROGRESS_REPORT, EVENT_TYPES.READ),
  paginationCollector(),
  getAllProgressReportController
);

router.post(
  "/",
  authorizePermission(MODULES.DAILY_PROGRESS_REPORT, EVENT_TYPES.CREATE),
  createProgressReportController
);

router.get(
  "/:id",
  authorizePermission(MODULES.DAILY_PROGRESS_REPORT, EVENT_TYPES.READ),
  getProgressReportByIdController
);

router.put(
  "/:id",
  authorizePermission(MODULES.DAILY_PROGRESS_REPORT, EVENT_TYPES.UPDATE),
  updateProgressReportController
);

router.delete(
  "/:id",
  authorizePermission(MODULES.DAILY_PROGRESS_REPORT, EVENT_TYPES.DELETE),
  deleteProgressReportController
);

export default router;
