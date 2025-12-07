import express from "express";
import {
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupById,
  getGroupAll
} from "../controllers/symptomGroup.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js"; // JWT middleware
import { authorizePermission } from "../middleware/authorization.js"; // Permission middleware
import { MODULES, EVENT_TYPES } from "../constants/auth.js"; // Auth constants

const router = express.Router();

// 🔐 Apply global authentication
router.use(authenticate);

// 📥 GET all symptom groups
router.get(
  '/',
  authorizePermission(MODULES.SYMPTOM_GROUP, EVENT_TYPES.READ),
  paginationCollector(),
  getGroupAll
);

// 📘 GET a symptom group by ID
router.get(
  '/:id',
  authorizePermission(MODULES.SYMPTOM_GROUP, EVENT_TYPES.READ),
  getGroupById
);

// ➕ POST create group
router.post(
  '/',
  authorizePermission(MODULES.SYMPTOM_GROUP, EVENT_TYPES.CREATE),
  createGroup
);

// 🔄 PUT update group
router.put(
  '/:id',
  authorizePermission(MODULES.SYMPTOM_GROUP, EVENT_TYPES.UPDATE),
  updateGroup
);

// 🗑️ DELETE group
router.delete(
  '/:id',
  authorizePermission(MODULES.SYMPTOM_GROUP, EVENT_TYPES.DELETE),
  deleteGroup
);

export default router;