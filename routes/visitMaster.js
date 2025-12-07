// routes/visitMaster.js
import express from "express";
import {
  createVisitMasterController,
  getAllVisitMastersController,
  getVisitMasterByIdController,
  getVisitMasterByInpatientCaseController,
  updateVisitMasterController,
  deleteVisitMasterController,
} from "../controllers/visitMasterController.js";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import { queryOptions } from "../middleware/query.js";
import visitMaster from "../models/VisitMaster.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/case",
  authorizePermission(MODULES.VISIT_MASTER, EVENT_TYPES.READ),
  getVisitMasterByInpatientCaseController
);

router.get(
  "/",
  authorizePermission(MODULES.VISIT_MASTER, EVENT_TYPES.READ),
  queryOptions(visitMaster),
  paginationCollector(),
  getAllVisitMastersController
);

router.get(
  "/:id",
  authorizePermission(MODULES.VISIT_MASTER, EVENT_TYPES.READ),
  getVisitMasterByIdController
);


router.post(
  "/",
  authorizePermission(MODULES.VISIT_MASTER, EVENT_TYPES.CREATE),
  createVisitMasterController
);

router.put(
  "/:id",
  authorizePermission(MODULES.VISIT_MASTER, EVENT_TYPES.UPDATE),
  updateVisitMasterController
);

router.delete(
  "/:id",
  authorizePermission(MODULES.VISIT_MASTER, EVENT_TYPES.DELETE),
  deleteVisitMasterController
);

export default router;
