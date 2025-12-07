import { createPurchaseOrderController, getAllPurchaseorderController, getByIdPurchaseorderController, updatePurchaseorderController, deletePurchaseOrderController, createReplacementPOController, getReplacementPOsByVendorController } from "../controllers/purchaseOrder.js";
import express from "express";
import { queryOptions } from "../middleware/query.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import PurchaseOrder from "../models/purchaseOrder.js";
const router = express.Router();
router.use(authenticate);


router.post("/", authorizePermission(MODULES.PURCHASE_ORDER, EVENT_TYPES.CREATE) ,createPurchaseOrderController);





// GET all medicines
router.get(
  "/",
  authorizePermission(MODULES.PURCHASE_ORDER, EVENT_TYPES.READ),
  getAllPurchaseorderController
);

// GET one medicine
router.get(
  "/:id",
  authorizePermission(MODULES.PURCHASE_ORDER, EVENT_TYPES.READ),
  getByIdPurchaseorderController
);




// PUT update inventoryitem
router.put(
  "/:id",
  authorizePermission(MODULES.PURCHASE_ORDER, EVENT_TYPES.UPDATE),
  updatePurchaseorderController
);

// POST import inventoryitem
// router.post(
//   "/import",
//   authorizePermission(MODULES.PURCHASE_ORDER, EVENT_TYPES.CREATE),
//   uploadSingleFile("file"),
//   uploadInventoryItems
// );

// DELETE inventoryitem
router.delete(
  "/:id",
  authorizePermission(MODULES.PURCHASE_ORDER, EVENT_TYPES.DELETE),
  deletePurchaseOrderController
);


      // Generate replacement PO for disposed medicines
router.post('/replacement', 
  authorizePermission(MODULES.PURCHASE_ORDER, EVENT_TYPES.CREATE),
  createReplacementPOController
);

router.get('/replacement/vendor/:vendorId', 
  authorizePermission(MODULES.PURCHASE_ORDER, EVENT_TYPES.READ),
  getReplacementPOsByVendorController
);

export default router;