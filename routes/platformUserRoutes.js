import express from "express";

const router = express.Router();
import {
    inviteUserController,
    loginUserController,
    getAllPlatformUsersController,
    updateUserAccessController,
    activateUserController,
    refreshTokenController
} from "../controllers/platformUserController.js";

import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

router.post('/invite', inviteUserController);
router.post('/login', loginUserController);
router.put('/activate', activateUserController);
router.post('/refresh-token', refreshTokenController);
router.get('/platformUsers', getAllPlatformUsersController);
router.put('/platformUser/:platformUserId', authenticate, authorize('edit_platform_user'), updateUserAccessController);

export default router;