import express from "express";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";
import {
  createRequestForQuotationController,
  getAllRequestForQuotationController,
  getByIdRequestForQuotationController,
  removeRequestForQuotationController,
  updateRequestForQuotationController,
} from "../controllers/requestForQuotation.js";
import requestForQuotation from "../models/requestForQuotation.js";
import { queryOptions } from "../middleware/query.js";

const router = express.Router();

// ✅ Routes with authentication
router.get(
  "/",
  authenticate,
  queryOptions(requestForQuotation),
  authorizePermission(MODULES.REQUEST_FOR_QUOTATION, EVENT_TYPES.READ),
  getAllRequestForQuotationController
);

router.get(
  "/:id",
  authenticate,
  authorizePermission(MODULES.REQUEST_FOR_QUOTATION, EVENT_TYPES.READ),
  getByIdRequestForQuotationController
);

router.post(
  "/",
  // authenticate,
  // authorizePermission(MODULES.REQUEST_FOR_QUOTATION, EVENT_TYPES.CREATE),
  createRequestForQuotationController
);

router.delete(
  "/:id",
  authenticate,
  authorizePermission(MODULES.REQUEST_FOR_QUOTATION, EVENT_TYPES.DELETE),
  removeRequestForQuotationController
);

// 🚨 PUT route with NO authentication or authorization
// ✅ PUT route with NO authentication or authorization
router.put(
  "/:id",
  updateRequestForQuotationController
);
  

export default router;
