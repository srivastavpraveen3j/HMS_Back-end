import express from "express";
import {
  createUserController,
  getAllUsersController,
  updateUserController,
  deleteUserController,
  searchUserController,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/authentication.js";
import { authorizePermission } from "../middleware/authorization.js";
import { MODULES, EVENT_TYPES } from "../constants/auth.js";

const router = express.Router();

// Protect all routes below
router.use(authenticate);

// Create a new user
router.post(
  "/",
  authorizePermission(MODULES.USERS, EVENT_TYPES.CREATE),
  createUserController
);

// router.get(
//   "/",
//   authorizePermission(MODULES.USERS, EVENT_TYPES.READ),
//   getUserByIdController
// );

// Get all users
router.get(
  "/",
  authorizePermission(MODULES.USERS, EVENT_TYPES.READ),
  getAllUsersController
);

// Update a user by ID
router.put(
  "/:id",
  authorizePermission(MODULES.USERS, EVENT_TYPES.UPDATE),
  updateUserController
);

// Delete a user by ID
router.delete(
  "/:id",
  authorizePermission(MODULES.USERS, EVENT_TYPES.DELETE),
  deleteUserController
);

router.get("/search", authorizePermission(MODULES.USERS, EVENT_TYPES.READ), searchUserController);

export default router;
