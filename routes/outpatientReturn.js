import {
  createOutpatientReturnController,
  deleteOutpatientReturnController,
  getAllOutpatientReturnsController,
  getOutpatientReturnByIdController,
  updateOutpatientReturnController
} from "../controllers/outpatientReturnController.js";

import express from "express";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const Router = express.Router();

// 🔐 Apply authentication globally
Router.use(authenticate);

// ➕ Create outpatient return
Router.post(
  "/",
  authorizePermission(MODULES.OUTPATIENT_RETURN, EVENT_TYPES.CREATE),
  createOutpatientReturnController
);

// 📄 Get all outpatient returns
Router.get(
  "/",
  authorizePermission(MODULES.OUTPATIENT_RETURN, EVENT_TYPES.READ),
  paginationCollector(),
  getAllOutpatientReturnsController
);

// 🔍 Get outpatient return by ID
Router.get(
  "/:id",
  authorizePermission(MODULES.OUTPATIENT_RETURN, EVENT_TYPES.READ),
  getOutpatientReturnByIdController
);

// ✏️ Update outpatient return
Router.put(
  "/:id",
  authorizePermission(MODULES.OUTPATIENT_RETURN, EVENT_TYPES.UPDATE),
  updateOutpatientReturnController
);

// ❌ Delete outpatient return
Router.delete(
  "/:id",
  authorizePermission(MODULES.OUTPATIENT_RETURN, EVENT_TYPES.DELETE),
  deleteOutpatientReturnController
);

export default Router;
