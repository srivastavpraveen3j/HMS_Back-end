import {
  createTestParameterController,
  getAllTestParametersController,
  getTestParameterByIdController,
  updateTestParameterController,
  deleteTestParameterController,
} from '../controllers/testParameterController.js';

import express from 'express';
import { paginationCollector } from "../middleware/queryParamsCollector.js";
import { authenticate } from '../middleware/authentication.js';
import { authorizePermission } from '../middleware/authorization.js';
import { MODULES, EVENT_TYPES } from '../constants/auth.js';
import { queryOptions } from '../middleware/query.js';
import TestParameter from '../models/TestParameter.js';
const router = express.Router();

// 🔐 Apply authentication middleware to all routes
router.use(authenticate);

// 📥 GET all test parameters with pagination
router.get(
  '/',
  authorizePermission(MODULES.TEST_PARAMETER, EVENT_TYPES.READ),
  paginationCollector(),
  queryOptions(TestParameter),
  getAllTestParametersController
);

// 🔍 GET a single test parameter by ID
router.get(
  '/:id',
  authorizePermission(MODULES.TEST_PARAMETER, EVENT_TYPES.READ),
  getTestParameterByIdController
);

// ➕ POST create a new test parameter
router.post(
  '/',
  authorizePermission(MODULES.TEST_PARAMETER, EVENT_TYPES.CREATE),
  createTestParameterController
);

// 🔄 PUT update test parameter by ID
router.put(
  '/:id',
  authorizePermission(MODULES.TEST_PARAMETER, EVENT_TYPES.UPDATE),
  updateTestParameterController
);

// 🗑️ DELETE test parameter by ID
router.delete(
  '/:id',
  authorizePermission(MODULES.TEST_PARAMETER, EVENT_TYPES.DELETE),
  deleteTestParameterController
);


export default router;
