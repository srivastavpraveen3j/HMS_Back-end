import express from "express";
import {
  getPermissionsController,
  createPermissionController,
  updatePermissionController,
  deletePermissionController,
} from "../controllers/permission.js";

import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

// 📄 Get all permissions
router.get(
  "/",
  authorizePermission(MODULES.PERMISSIONS, EVENT_TYPES.READ),
  getPermissionsController
);

// ➕ Create a permission
router.post(
  "/",
  authorizePermission(MODULES.PERMISSIONS, EVENT_TYPES.CREATE),
  createPermissionController
);

// ✏️ Update a permission
router.put(
  "/:id",
  authorizePermission(MODULES.PERMISSIONS, EVENT_TYPES.UPDATE),
  updatePermissionController
);

// ❌ Delete a permission
router.delete(
  "/:id",
  authorizePermission(MODULES.PERMISSIONS, EVENT_TYPES.DELETE),
  deletePermissionController
);

export default router;
