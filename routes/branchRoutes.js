import express from "express";

import {
    getBranchByIdController,
    createBranchController,
    updateBranchController,
    deleteBranchController,
    activateBranchController,
    deactivateBranchController,
    getAllBranchesController,
} from "../controllers/BranchController.js";

import { getNamespaceByApiKey } from "../middleware/NameSpace.js";

const router = express.Router();

router.use(getNamespaceByApiKey);

router.get('/', getAllBranchesController);
router.get('/:id', getBranchByIdController);
router.post('/', createBranchController);
router.put('/:id', updateBranchController);
router.delete('/:id', deleteBranchController);
router.put('/:id/activate', activateBranchController);
router.put('/:id/deactivate', deactivateBranchController);

export default router;
