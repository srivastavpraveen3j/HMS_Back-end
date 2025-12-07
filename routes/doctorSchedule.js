import express from "express";
import {
  createScheduleController,
  getSchedulesController,
  getScheduleByIdController,
  updateScheduleController,
  deleteScheduleController,
  addExceptionController,
  removeExceptionController,
} from "../controllers/doctorSchedule.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { EVENT_TYPES, MODULES } from "../constants/auth.js";

const router = express.Router();
router.use(authenticate);

// CRUD
router.post(
  "/",
  authorizePermission(MODULES.SLOT_MASTER, EVENT_TYPES.CREATE),
  createScheduleController
);
router.get(
  "/",
  authorizePermission(MODULES.SLOT_MASTER, EVENT_TYPES.READ),
  getSchedulesController
);
router.get(
  "/:id",
  authorizePermission(MODULES.SLOT_MASTER, EVENT_TYPES.READ),
  getScheduleByIdController
);
router.put(
  "/:id",
  authorizePermission(MODULES.SLOT_MASTER, EVENT_TYPES.UPDATE),
  updateScheduleController
);
router.delete(
  "/:id",
  authorizePermission(MODULES.SLOT_MASTER, EVENT_TYPES.DELETE),
  deleteScheduleController
);

// Exceptions
router.post("/:id/exceptions", addExceptionController);
router.delete("/:id/exceptions/:exceptionId", removeExceptionController);

export default router;
