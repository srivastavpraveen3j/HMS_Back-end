import express from "express";
import {
  getAllSharedDataController,
  getsharedDataByIdController,
} from "../controllers/sharedPatientCases.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import { authorizePermission } from "../middleware/authorization.js";
import { authenticate } from "../middleware/authentication.js";
const router = express.Router();
router.use(authenticate);


router.get(
  "/",
  authorizePermission(MODULES.DOCTOR_SHARING, EVENT_TYPES.READ),
  paginationCollector(),
  getAllSharedDataController
);

router.get(
  "/:id",
  authorizePermission(MODULES.DOCTOR_SHARING, EVENT_TYPES.READ),
  paginationCollector(),
  getsharedDataByIdController
);

export default router;