import express from "express";
import {
  createPharmaceuticalRequestListController,
  getPharmaceuticalRequestListController,
  getAllPharmaceuticalRequestListController,
  updatePharmaceuticalRequestListController,
  deletePharmaceuticalRequestListController,
  getPharmaceuticalRequestByCaseController,
  CreatewithoutIpdpermissionPharmaceuticalRequestListController,
  getAllwithoutIPDpermissionPharmaceuticalRequestListController,
  getwithoutIPDpermissionPharmaceuticalRequestListController,
  updatewithoutIPDpermissionPharmaceuticalRequestListController,
  deletewithoutIPDpermissionPharmaceuticalRequestListController,
  getwithoutIPDpermissionPharmaceuticalRequestByCaseController
} from "../controllers/PharmaceuticalRequestList.js";

import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import { dynamicFilterMiddleware } from "../middleware/dynamicFilterMiddleware.js";

const router = express.Router();


// 🔐 Global authentication
router.use(authenticate);

router.get("/case",
  authorizePermission(MODULES.PHARMA_REQUEST_LIST, EVENT_TYPES.READ),
  paginationCollector(),
  getPharmaceuticalRequestByCaseController
);
router.get("/withoutipdpharmacase",
  authorizePermission(MODULES.PHARMA_REQUEST_LIST, EVENT_TYPES.READ),
  paginationCollector(),
  getwithoutIPDpermissionPharmaceuticalRequestByCaseController
);

// ➕ Create a new pharmaceutical request
router.post(
  "/",
  authorizePermission(MODULES.PHARMA_REQUEST_LIST, EVENT_TYPES.CREATE),
  createPharmaceuticalRequestListController
);


// 📄 Get all pharmaceutical requests with pagination
router.get(
  "/",
  authorizePermission(MODULES.PHARMA_REQUEST_LIST, EVENT_TYPES.READ),
  paginationCollector(),
  dynamicFilterMiddleware,
  getAllPharmaceuticalRequestListController
);

// 🔍 Get a single pharmaceutical request by ID
router.get(
  "/:id",
  authorizePermission(MODULES.PHARMA_REQUEST_LIST, EVENT_TYPES.READ),
  getPharmaceuticalRequestListController
);

// ✏️ Update a pharmaceutical request
router.put(
  "/:id",
  authorizePermission(MODULES.PHARMA_REQUEST_LIST, EVENT_TYPES.UPDATE),
  updatePharmaceuticalRequestListController
);

// ❌ Delete a pharmaceutical request
router.delete(
  "/:id",
  authorizePermission(MODULES.PHARMA_REQUEST_LIST, EVENT_TYPES.DELETE),
  deletePharmaceuticalRequestListController
);

// without ipd pahram permission

router.post(
  "/withoutipdpermission",
  authorizePermission(MODULES.PHARMA_REQUEST_LIST, EVENT_TYPES.CREATE),
  CreatewithoutIpdpermissionPharmaceuticalRequestListController
);
router.get(
  "/",
  authorizePermission(MODULES.PHARMA_REQUEST_LIST, EVENT_TYPES.READ),
  paginationCollector(),
  dynamicFilterMiddleware,
  getAllwithoutIPDpermissionPharmaceuticalRequestListController
);

// 🔍 Get a single pharmaceutical request by ID
router.get(
  "/:id",
  authorizePermission(MODULES.PHARMA_REQUEST_LIST, EVENT_TYPES.READ),
  getwithoutIPDpermissionPharmaceuticalRequestListController
);

// ✏️ Update a pharmaceutical request
router.put(
  "/:id",
  authorizePermission(MODULES.PHARMA_REQUEST_LIST, EVENT_TYPES.UPDATE),
  updatewithoutIPDpermissionPharmaceuticalRequestListController
);

// ❌ Delete a pharmaceutical request
router.delete(
  "/:id",
  authorizePermission(MODULES.PHARMA_REQUEST_LIST, EVENT_TYPES.DELETE),
  deletewithoutIPDpermissionPharmaceuticalRequestListController
);


export default router;
