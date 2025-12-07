import express from "express";
import { create,getAll, getById,update,remove  } from "../controllers/purchaseIndent.js";
import purchaseIndent from "../models/purchaseIndent.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import { queryOptions } from "../middleware/query.js";


const router = express.Router();

router.use(authenticate);

router.get("/", 
 queryOptions(purchaseIndent),
   authorizePermission(MODULES.PURCHASE_INTEND, EVENT_TYPES.READ),
  getAll);
router.get("/:id",
   authorizePermission(MODULES.PURCHASE_INTEND, EVENT_TYPES.READ),
  getById);

router.post(
  "/",
  authorizePermission(MODULES.PURCHASE_INTEND, EVENT_TYPES.CREATE),
  create
);
router.put("/:id",
   authorizePermission(MODULES.PURCHASE_INTEND, EVENT_TYPES.UPDATE),
       update);
router.delete("/:id", 
      authorizePermission(MODULES.PURCHASE_INTEND, EVENT_TYPES.DELETE),
      remove);




export default router;