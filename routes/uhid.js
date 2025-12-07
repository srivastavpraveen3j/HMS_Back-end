import {
  createNewUHID,
  getUHIDs,
  getUHID,
  deleteUHIDById,
  updateUHIDById
} from "../controllers/uhid.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

import express from "express";
const router = express.Router();

// 🔐 Global authentication middleware
router.use(authenticate);

// 📥 GET all UHIDs (with pagination)
router.get(
  '/',
  authorizePermission(MODULES.UHID, EVENT_TYPES.READ),
  paginationCollector(),
  getUHIDs
);

// 🔍 GET a single UHID by ID
router.get(
  '/:id',
  authorizePermission(MODULES.UHID, EVENT_TYPES.READ),
  getUHID
);

// ➕ POST create a new UHID
router.post(
  '/',
  authorizePermission(MODULES.UHID, EVENT_TYPES.CREATE),
  createNewUHID
);

// 🗑️ DELETE UHID by ID
router.delete(
  '/:id',
  authorizePermission(MODULES.UHID, EVENT_TYPES.DELETE),
  deleteUHIDById
);

// 🔄 PUT update UHID by ID
router.put(
  '/:id',
  authorizePermission(MODULES.UHID, EVENT_TYPES.UPDATE),
  updateUHIDById
);

export default router;