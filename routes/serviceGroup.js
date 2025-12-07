import express from "express";
import {
  createServiceGroupController,
  getAllServiceGroupsController,
  updateServiceGroupController,
  deleteServiceGroupController,
  getServiceGroupByIdController
} from "../controllers/serviceGroup.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// 🔐 Apply global authentication
router.use(authenticate);

// 📥 GET all service groups with pagination
router.get(
  '/',
  authorizePermission(MODULES.SERVICE_GROUP, EVENT_TYPES.READ),
  paginationCollector(),
  getAllServiceGroupsController
);

// ➕ Create a new service group
router.post(
  '/',
  authorizePermission(MODULES.SERVICE_GROUP, EVENT_TYPES.CREATE),
  createServiceGroupController
);

// 🔄 Update a service group
router.put(
  '/:id',
  authorizePermission(MODULES.SERVICE_GROUP, EVENT_TYPES.UPDATE),
  updateServiceGroupController
);

// 🗑️ Delete a service group
router.delete(
  '/:id',
  authorizePermission(MODULES.SERVICE_GROUP, EVENT_TYPES.DELETE),
  deleteServiceGroupController
);

router.get('/:id', authorizePermission(MODULES.SERVICE_GROUP, EVENT_TYPES.READ), getServiceGroupByIdController)

export default router;