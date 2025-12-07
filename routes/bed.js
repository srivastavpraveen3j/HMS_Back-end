import express from "express";
import {
  createBedController,
  getBedController,
  getBedsController,
  updateBedController,
  deleteBedController
} from "../controllers/bed.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import { queryOptions } from "../middleware/query.js";
import  bed  from "../models/Bed.js";

const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

// 📥 GET all beds with pagination
router.get(
  '/',
  authorizePermission(MODULES.BED, EVENT_TYPES.READ),
  // queryOptions(bed),
  paginationCollector(),
  getBedsController
);

// ➕ POST create a new bed
router.post(
  '/',
  authorizePermission(MODULES.BED, EVENT_TYPES.CREATE),
  createBedController
);

// 🔍 GET bed by ID
router.get(
  '/:id',
  authorizePermission(MODULES.BED, EVENT_TYPES.READ),
  getBedController
);

// 🔄 PUT update bed by ID
router.put(
  '/:id',
  authorizePermission(MODULES.BED, EVENT_TYPES.UPDATE),
  updateBedController
);

// 🗑️ DELETE bed by ID
router.delete(
  '/:id',
  authorizePermission(MODULES.BED, EVENT_TYPES.DELETE),
  deleteBedController
);

export default router;