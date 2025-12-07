import {
    createPlatformPermissionController,
    getAllPlatformPermissionsController,
    getPlatformPermissionByIdController,
    updatePlatformPermissionController,
    deletePlatformPermissionController,
    addRolesToPermissionController,
} from "../controllers/platformUserPermissionController.js";
import { Router } from 'express';

const router = Router();

router.post('/', createPlatformPermissionController);
router.get('/', getAllPlatformPermissionsController);
router.get('/:id', getPlatformPermissionByIdController);
router.put('/:id', updatePlatformPermissionController);
router.delete('/:id', deletePlatformPermissionController);
router.post('/:id/roles', addRolesToPermissionController);

export default router;