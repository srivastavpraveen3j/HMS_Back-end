import {
  createThirdPartyAdministratorController,
  getAllThirdPartyAdministratorController,
  getThirdPartyAdministratorByIdController,
  updateThirdPartyAdministratorController,
  deleteThirdPartyAdministratorController
} from "../controllers/thirdPartyAdministrator.js";

import { Router } from "express";
const router = Router();

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

// 🔐 Apply authentication to all routes
router.use(authenticate);

// ➕ Create new TPA
router.post(
  "/",
  authorizePermission(MODULES.THIRD_PARTY_ADMIN, EVENT_TYPES.CREATE),
  createThirdPartyAdministratorController
);

// 📄 Get all TPAs
router.get(
  "/",
  authorizePermission(MODULES.THIRD_PARTY_ADMIN, EVENT_TYPES.READ),
  paginationCollector(),
  getAllThirdPartyAdministratorController
);

// 🔍 Get a specific TPA by ID
router.get(
  "/:id",
  authorizePermission(MODULES.THIRD_PARTY_ADMIN, EVENT_TYPES.READ),
  getThirdPartyAdministratorByIdController
);

// ✏️ Update TPA
router.put(
  "/:id",
  authorizePermission(MODULES.THIRD_PARTY_ADMIN, EVENT_TYPES.UPDATE),
  updateThirdPartyAdministratorController
);

// ❌ Delete TPA
router.delete(
  "/:id",
  authorizePermission(MODULES.THIRD_PARTY_ADMIN, EVENT_TYPES.DELETE),
  deleteThirdPartyAdministratorController
);

export default router;
