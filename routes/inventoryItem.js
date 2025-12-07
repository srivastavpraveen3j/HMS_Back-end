import express from "express";
import { createInventoryitemController, updateInventoryItemController, deleteInventoryItemController, getAllInventoryItemsController, uploadInventoryItems, getInventoryItemByIdController } from "../controllers/inventoryItemController.js";
import { queryOptions } from "../middleware/query.js";
import InventoryItem from "../models/inventoryItem.js";
import { uploadSingleFile } from "../middleware/multer.middleware.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// Apply authenticate globally to all medicine routes
router.use(authenticate);



// GET all medicines
router.get(
  "/",
  authorizePermission(MODULES.INVENTORY_ITEM, EVENT_TYPES.READ),
  queryOptions(InventoryItem),
  getAllInventoryItemsController
);

// GET one medicine
router.get(
  "/:id",
  authorizePermission(MODULES.INVENTORY_ITEM, EVENT_TYPES.READ),
  getInventoryItemByIdController
);


// POST new inventoryitem
router.post(
  "/",
  authorizePermission(MODULES.INVENTORY_ITEM, EVENT_TYPES.CREATE),
  createInventoryitemController
);



// PUT update inventoryitem
router.put(
  "/:id",
  authorizePermission(MODULES.INVENTORY_ITEM, EVENT_TYPES.UPDATE),
  updateInventoryItemController
);

// POST import inventoryitem
router.post(
  "/import",
  authorizePermission(MODULES.INVENTORY_ITEM, EVENT_TYPES.CREATE),
  uploadSingleFile("file"),
  uploadInventoryItems
);

// DELETE inventoryitem
router.delete(
  "/:id",
  authorizePermission(MODULES.INVENTORY_ITEM, EVENT_TYPES.DELETE),
  deleteInventoryItemController
);




export default router;
