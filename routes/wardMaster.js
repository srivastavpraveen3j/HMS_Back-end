import express from "express";
import {
  createNewWardMaster,
  getWardMasters,
  getWardMasterByIdHandler,
  updateWardMasterByIdHandler,
  deleteWardMasterByIdHandler
} from "../controllers/wardMaster.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import { queryOptions } from "../middleware/query.js";
import  wardMaster  from "../models/wardMaster.js";
const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

// 📄 GET all ward masters with pagination
router.get(
  '/',
  authorizePermission(MODULES.WARD_MASTER, EVENT_TYPES.READ),
  paginationCollector(),
  // queryOptions(wardMaster),
  getWardMasters
);

// 🔍 GET specific ward master by ID
router.get(
  '/:id',
  authorizePermission(MODULES.WARD_MASTER, EVENT_TYPES.READ),
  getWardMasterByIdHandler
);

// ➕ POST create new ward master
router.post(
  '/',
  authorizePermission(MODULES.WARD_MASTER, EVENT_TYPES.CREATE),
  createNewWardMaster
);

// ✏️ PUT update ward master by ID
router.put(
  '/:id',
  authorizePermission(MODULES.WARD_MASTER, EVENT_TYPES.UPDATE),
  updateWardMasterByIdHandler
);

// 🗑️ DELETE ward master by ID
router.delete(
  '/:id',
  authorizePermission(MODULES.WARD_MASTER, EVENT_TYPES.DELETE),
  deleteWardMasterByIdHandler
);

export default router;
