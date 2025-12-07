import express from "express";
import {
  createAppointmentController,
  getAllAppointmentsController,
  getAppointmentByIdController,
  updateAppointmentController,
  deleteAppointmentController,
} from "../controllers/appointmentController.js"; // Adjust path if necessary

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
const router = express.Router();
router.use(authenticate);

router.post(
  "/",
  authorizePermission(MODULES.APPOINTMENT, EVENT_TYPES.CREATE),
  createAppointmentController
);

router.get(
  "/",
  authorizePermission(MODULES.APPOINTMENT, EVENT_TYPES.READ),
  paginationCollector(),
  getAllAppointmentsController
);

router.get(
  "/:id",
  authorizePermission(MODULES.APPOINTMENT, EVENT_TYPES.READ),
  getAppointmentByIdController
);

router.put(
  "/:id",
  authorizePermission(MODULES.APPOINTMENT, EVENT_TYPES.UPDATE),
  updateAppointmentController
);

router.delete(
  "/:id",
  authorizePermission(MODULES.APPOINTMENT, EVENT_TYPES.DELETE),
  deleteAppointmentController
);

export default router;
