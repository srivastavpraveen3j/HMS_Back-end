import {
  createOTnotesController,
  getAllOTNotesController,
  getOTNotesByIdController,
  updateOTNotesController,
  deleteOTNotesController,
  getOTNotesByCaseIdController,
} from "../controllers/operationTheatreNotesController.js";

import express from "express";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

router.get(
  "/case",
  authorizePermission(MODULES.OPERATION_THEATRE_NOTES, EVENT_TYPES.READ),
  getOTNotesByCaseIdController
);

// 📄 GET all OT notes
router.get(
  "/",
  authorizePermission(MODULES.OPERATION_THEATRE_NOTES, EVENT_TYPES.READ),
  getAllOTNotesController
);

// 🔍 GET OT note by ID
router.get(
  "/:id",
  authorizePermission(MODULES.OPERATION_THEATRE_NOTES, EVENT_TYPES.READ),
  getOTNotesByIdController
);

// ➕ POST new OT note
router.post(
  "/",
  authorizePermission(MODULES.OPERATION_THEATRE_NOTES, EVENT_TYPES.CREATE),
  createOTnotesController
);

// ✏️ PUT update OT note
router.put(
  "/:id",
  authorizePermission(MODULES.OPERATION_THEATRE_NOTES, EVENT_TYPES.UPDATE),
  updateOTNotesController
);

// ❌ DELETE OT note
router.delete(
  "/:id",
  authorizePermission(MODULES.OPERATION_THEATRE_NOTES, EVENT_TYPES.DELETE),
  deleteOTNotesController
);

export default router;
