import { getAllPlatformRolesController, getPlatformRoleByIdController, createPlatformRoleController, updatePlatformRoleController, deletePlatformRoleController, addPermissionsToRoleController, removePermissionsFromRoleController } from "../controllers/platformUserRoleController.js";

import express from "express";

const   router = express.Router();

router.get('/', getAllPlatformRolesController);
router.get('/:id', getPlatformRoleByIdController);
router.post('/', createPlatformRoleController);
router.put('/:id', updatePlatformRoleController);
router.delete('/:id', deletePlatformRoleController);

export default router;