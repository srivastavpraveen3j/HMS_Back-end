// routes/visitTypeMaster.js
import express from "express";
import {
  createVisitTypeMasterController,
  getAllVisitTypeMastersController,
  updateVisitTypeMasterController,
  deleteVisitTypeMasterController,
  getVisitTypeMasterByIdController,
} from "../controllers/visitTypeMasterController.js";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import { queryOptions } from "../middleware/query.js";
import visitTypeMaster from "../models/VisitTypeMaster.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  authorizePermission(MODULES.VISIT_TYPE_MASTER, EVENT_TYPES.READ),
  queryOptions(visitTypeMaster),
  paginationCollector(),
  getAllVisitTypeMastersController
);

router.get(
  "/:id",
  authorizePermission(MODULES.VISIT_TYPE_MASTER, EVENT_TYPES.READ),
  getVisitTypeMasterByIdController
);

router.post(
  "/",
  authorizePermission(MODULES.VISIT_TYPE_MASTER, EVENT_TYPES.CREATE),
  createVisitTypeMasterController
);

router.put(
  "/:id",
  authorizePermission(MODULES.VISIT_TYPE_MASTER, EVENT_TYPES.UPDATE),
  updateVisitTypeMasterController
);

router.delete(
  "/:id",
  authorizePermission(MODULES.VISIT_TYPE_MASTER, EVENT_TYPES.DELETE),
  deleteVisitTypeMasterController
);

export default router;
