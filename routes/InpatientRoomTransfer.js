import express from "express";
import {
  createInpatientRoomTransfer,
  getAllInpatientRoomTransfer,
  getInpatientRoomTransferById,
  updateInpatientRoomTransfer,
  deleteInpatientRoomTransfer,
  getInpatientRoomTransferByCase,
  addNewTransfer,
  updateInpatientRoomLog,
} from "../controllers/InpatientRoomTransfer.js";

import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import { paginationCollector } from "../middleware/queryParamsCollector.js";

const router = express.Router();

// 🔐 Apply authentication globally
router.use(authenticate);

router.get(
  "/case",
  authorizePermission(MODULES.INPATIENT_ROOM_TRANSFER, EVENT_TYPES.READ),
  getInpatientRoomTransferByCase
);

// ➕ Create a new room transfer
router.post(
  "/",
  authorizePermission(MODULES.INPATIENT_ROOM_TRANSFER, EVENT_TYPES.CREATE),
  createInpatientRoomTransfer
);

// 📄 Get all room transfers
router.get(
  "/",
  authorizePermission(MODULES.INPATIENT_ROOM_TRANSFER, EVENT_TYPES.READ),
  paginationCollector(),
  getAllInpatientRoomTransfer
);

// 🔍 Get room transfer by ID
router.get(
  "/:id",
  authorizePermission(MODULES.INPATIENT_ROOM_TRANSFER, EVENT_TYPES.READ),
  getInpatientRoomTransferById
);

// ✏️ Update room transfer
router.put(
  "/:id/transfers/:transferId",
  authorizePermission(MODULES.INPATIENT_ROOM_TRANSFER, EVENT_TYPES.UPDATE),
  updateInpatientRoomTransfer
);

router.patch(
  "/:id/transfers",
  authorizePermission(MODULES.INPATIENT_ROOM_TRANSFER, EVENT_TYPES.UPDATE),
  addNewTransfer
);

// ✏️ Update room log
router.put(
  "/:id/logs/:logId",
  authorizePermission(MODULES.INPATIENT_ROOM_TRANSFER, EVENT_TYPES.UPDATE),
  updateInpatientRoomLog
);

// ❌ Delete room transfer
router.delete(
  "/:id",
  authorizePermission(MODULES.INPATIENT_ROOM_TRANSFER, EVENT_TYPES.DELETE),
  deleteInpatientRoomTransfer
);

export default router;
