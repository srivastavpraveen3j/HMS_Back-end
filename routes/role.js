import express from "express";
import {
  getAllRolesController,
  getRoleByIdController,
  createRoleController,
  updateRoleController,
  deleteRoleController,
} from "../controllers/role.js";

import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// 🔐 Apply authentication globally
router.use(authenticate);

// 📄 Get all roles
router.get(
  "/",
  authorizePermission(MODULES.ROLES, EVENT_TYPES.READ),
  getAllRolesController
);

// 🔍 Get a specific role
router.get(
  "/:id",
  authorizePermission(MODULES.ROLES, EVENT_TYPES.READ),
  getRoleByIdController
);

// ➕ Create a new role
router.post(
  "/",
  authorizePermission(MODULES.ROLES, EVENT_TYPES.CREATE),
  createRoleController
);

// ✏️ Update a role
router.put(
  "/:id",
  authorizePermission(MODULES.ROLES, EVENT_TYPES.UPDATE),
  updateRoleController
);

// ❌ Delete a role
router.delete(
  "/:id",
  authorizePermission(MODULES.ROLES, EVENT_TYPES.DELETE),
  deleteRoleController
);

export default router;
