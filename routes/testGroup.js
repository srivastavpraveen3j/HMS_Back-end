import {
  createTestGroupController,
  getAllTestGroupsController,
  getTestGroupByIdController,
  updateTestGroupController,
  deleteTestGroupController,
  getTests
} from '../controllers/testGroupController.js';

import express from 'express';
import { paginationCollector } from '../middleware/queryParamsCollector.js';
import { authenticate } from '../middleware/authentication.js';
import { authorizePermission } from '../middleware/authorization.js';
import { MODULES, EVENT_TYPES } from '../constants/auth.js';

const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

// 📥 GET all test groups with pagination
router.get(
  '/',
  authorizePermission(MODULES.TEST_GROUP, EVENT_TYPES.READ),
  paginationCollector(),
  getAllTestGroupsController
);

// 🔍 GET a single test group by ID
router.get(
  '/:id',
  authorizePermission(MODULES.TEST_GROUP, EVENT_TYPES.READ),
  getTestGroupByIdController
);

// ➕ POST create a new test group
router.post(
  '/',
  authorizePermission(MODULES.TEST_GROUP, EVENT_TYPES.CREATE),
  createTestGroupController
);

// 🔄 PUT update a test group by ID
router.put(
  '/:id',
  authorizePermission(MODULES.TEST_GROUP, EVENT_TYPES.UPDATE),
  updateTestGroupController
);

// 🗑️ DELETE a test group by ID
router.delete(
  '/:id',
  authorizePermission(MODULES.TEST_GROUP, EVENT_TYPES.DELETE),
  deleteTestGroupController
);

export default router;