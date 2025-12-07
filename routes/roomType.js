import express from "express";
import {
  createRoomTypeController,
  getRoomTypesController,
  getRoomTypeController,
  updateRoomTypeController,
  deleteRoomTypeController
} from "../controllers/roomType.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

// 📥 GET all room types with pagination
router.get(
  '/',
  authorizePermission(MODULES.ROOM_TYPE, EVENT_TYPES.READ),
  paginationCollector(),
  getRoomTypesController
);

// 🔍 GET room type by ID
router.get(
  '/:id',
  authorizePermission(MODULES.ROOM_TYPE, EVENT_TYPES.READ),
  getRoomTypeController
);

// ➕ POST create a new room type
router.post(
  '/',
  authorizePermission(MODULES.ROOM_TYPE, EVENT_TYPES.CREATE),
  createRoomTypeController
);

// 🔄 PUT update room type by ID
router.put(
  '/:id',
  authorizePermission(MODULES.ROOM_TYPE, EVENT_TYPES.UPDATE),
  updateRoomTypeController
);

// 🗑️ DELETE room type by ID
router.delete(
  '/:id',
  authorizePermission(MODULES.ROOM_TYPE, EVENT_TYPES.DELETE),
  deleteRoomTypeController
);

export default router;
