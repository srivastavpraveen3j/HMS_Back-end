import express from "express";
import {
  createRoomController,
  getRoomsController,
  getRoomController,
  updateRoomController,
  deleteRoomController
} from "../controllers/room.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

// 📥 GET all rooms with pagination
router.get(
  '/',
  authorizePermission(MODULES.ROOM, EVENT_TYPES.READ),
  paginationCollector(),
  getRoomsController
);

// 🔍 GET room by ID
router.get(
  '/:id',
  authorizePermission(MODULES.ROOM, EVENT_TYPES.READ),
  getRoomController
);

// ➕ POST create a room
router.post(
  '/',
  authorizePermission(MODULES.ROOM, EVENT_TYPES.CREATE),
  createRoomController
);

// 🔄 PUT update room by ID
router.put(
  '/:id',
  authorizePermission(MODULES.ROOM, EVENT_TYPES.UPDATE),
  updateRoomController
);

// 🗑️ DELETE room by ID
router.delete(
  '/:id',
  authorizePermission(MODULES.ROOM, EVENT_TYPES.DELETE),
  deleteRoomController
);

export default router;
