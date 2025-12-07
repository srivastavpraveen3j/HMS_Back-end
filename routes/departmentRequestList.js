import express from 'express';

const router = express.Router();

import {
  createDepartmentRequestList,
  getAllDepartmentRequestList,
  getDepartmentRequestListById,
  updateDepartmentRequestList,
  deleteDepartmentRequestList
} from "../controllers/departmentReqListController.js";

import { dynamicFilterMiddleware } from "../middleware/dynamicFilterMiddleware.js";
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

// 🔐 Apply authentication to all routes
router.use(authenticate);

// 📄 GET all department requests with filters
router.get(
  '/',
  authorizePermission(MODULES.DEPARTMENT_REQUEST_LIST, EVENT_TYPES.READ),
  paginationCollector(),
  dynamicFilterMiddleware,
  getAllDepartmentRequestList
);

// 🔍 GET department request by ID
router.get(
  '/:id',
  authorizePermission(MODULES.DEPARTMENT_REQUEST_LIST, EVENT_TYPES.READ),
  getDepartmentRequestListById
);

// ➕ POST new department request
router.post(
  '/',
  authorizePermission(MODULES.DEPARTMENT_REQUEST_LIST, EVENT_TYPES.CREATE),
  createDepartmentRequestList
);

// ✏️ PUT update department request
router.put(
  '/:id',
  authorizePermission(MODULES.DEPARTMENT_REQUEST_LIST, EVENT_TYPES.UPDATE),
  updateDepartmentRequestList
);

// ❌ DELETE department request
router.delete(
  '/:id',
  authorizePermission(MODULES.DEPARTMENT_REQUEST_LIST, EVENT_TYPES.DELETE),
  deleteDepartmentRequestList
);

export default router;
