import express from "express";
import {
  createVendorController,
  getAllVendorController,
  getByIdVendorController,
  updateVendorController,
  removeVendorController,
  uploadVendor,
} from "../controllers/vendor.js";
import { uploadSingleFile } from "../middleware/multer.middleware.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import { queryOptions } from "../middleware/query.js";
// import vendor from "../models/vendor.js";
import Vendor from "../models/vendor.js";

const router = express.Router();

router.use(authenticate);

// GET all medicines
router.get(
  "/",
  authorizePermission(MODULES.VENDOR, EVENT_TYPES.READ),
  queryOptions(Vendor),
  getAllVendorController
);

// GET one medicine
router.get(
  "/:id",
  authorizePermission(MODULES.VENDOR, EVENT_TYPES.READ),
  getByIdVendorController
);

// POST new inventoryitem
router.post(
  "/",
  authorizePermission(MODULES.VENDOR, EVENT_TYPES.CREATE),
  createVendorController
);

// PUT update inventoryitem
router.put(
  "/:id",
  authorizePermission(MODULES.VENDOR, EVENT_TYPES.UPDATE),
  updateVendorController
);

// POST import inventoryitem
// router.post(
//   "/import",
//   authorizePermission(MODULES.VENDOR, EVENT_TYPES.CREATE),
//   uploadSingleFile("file"),
//   updateVendorController
// );

// DELETE inventoryitem
router.delete(
  "/:id",
  authorizePermission(MODULES.VENDOR, EVENT_TYPES.DELETE),
  removeVendorController
);

// POST import inventoryitem
router.post(
  "/import",
  authorizePermission(MODULES.VENDOR, EVENT_TYPES.CREATE),
  uploadSingleFile("file"),
  uploadVendor
);

export default router;
