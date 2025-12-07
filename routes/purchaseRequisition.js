import {
  create,
  getAll,
  getById,
  update,
  remove,
  createBulkMaterialRequests,
} from "../controllers/purchaseRequisition.js";

import express from "express";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
const router = express.Router();
router.use(authenticate);

router.get("/", 
  authorizePermission(MODULES.MATERIAL_REQUEST_LIST, EVENT_TYPES.READ),
  paginationCollector(),
  getAll);
router.get("/:id",
  authorizePermission(MODULES.MATERIAL_REQUEST_LIST, EVENT_TYPES.READ),
   getById);
router.post("/",
  authorizePermission(MODULES.MATERIAL_REQUEST_LIST, EVENT_TYPES.CREATE),
   create);
router.put("/:id",
  authorizePermission(MODULES.MATERIAL_REQUEST_LIST, EVENT_TYPES.UPDATE),
   update);
router.delete("/:id",
  authorizePermission(MODULES.MATERIAL_REQUEST_LIST, EVENT_TYPES.DELETE),
   remove);
router.post("/bulk",
  authorizePermission(MODULES.MATERIAL_REQUEST_LIST, EVENT_TYPES.CREATE),
   createBulkMaterialRequests);


export default router;
