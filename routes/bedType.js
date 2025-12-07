import express from "express";
import {
  createBedTypeController,
  getBedTypesController,
  getBedTypeController,
  updateBedTypeController,
  deleteBedTypeController
} from "../controllers/bedType.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import BedType from "../models/BedTypeSchema.js";
import { queryOptions } from "../middleware/query.js";
const router = express.Router();

// 🔐 Apply global authentication middleware
router.use(authenticate);

// 📥 GET all bed types with pagination
router.get(
  '/',
  authorizePermission(MODULES.BED_TYPE, EVENT_TYPES.READ),
  paginationCollector(),
  queryOptions(BedType),
  getBedTypesController
);

// 🔍 GET a single bed type by ID
router.get(
  '/:id',
  authorizePermission(MODULES.BED_TYPE, EVENT_TYPES.READ),
  getBedTypeController
);

// ➕ POST create a new bed type
router.post(
  '/',
  authorizePermission(MODULES.BED_TYPE, EVENT_TYPES.CREATE),
  createBedTypeController
);

// 🔄 PUT update a bed type by ID
router.put(
  '/:id',
  authorizePermission(MODULES.BED_TYPE, EVENT_TYPES.UPDATE),
  updateBedTypeController
);

// 🗑️ DELETE a bed type by ID
router.delete(
  '/:id',
  authorizePermission(MODULES.BED_TYPE, EVENT_TYPES.DELETE),
  deleteBedTypeController
);

export default router;