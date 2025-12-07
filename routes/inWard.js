import {
  createInWardController,
  getAllInWardsController,
  getInWardByIdController,
  updateInWardController,
  deleteInWardController
} from '../controllers/inWardController.js';

import express from "express";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// 🔐 Apply authentication to all routes
router.use(authenticate);

// GET all in-ward entries
router.get(
  '/',
  authorizePermission(MODULES.INWARD, EVENT_TYPES.READ),
  getAllInWardsController
);

// GET a single in-ward entry by ID
router.get(
  '/:id',
  authorizePermission(MODULES.INWARD, EVENT_TYPES.READ),
  getInWardByIdController
);

// POST a new in-ward entry
router.post(
  '/',
  authorizePermission(MODULES.INWARD, EVENT_TYPES.CREATE),
  createInWardController
);

// PUT update an in-ward entry
router.put(
  '/:id',
  authorizePermission(MODULES.INWARD, EVENT_TYPES.UPDATE),
  updateInWardController
);

// DELETE an in-ward entry
router.delete(
  '/:id',
  authorizePermission(MODULES.INWARD, EVENT_TYPES.DELETE),
  deleteInWardController
);

export default router;