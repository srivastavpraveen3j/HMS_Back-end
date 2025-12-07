import {
    createTestMasterController,
    getAllTestMastersController,
    getTestMasterByIdController,
    updateTestMasterController,
    deleteTestMasterController
} from '../controllers/testMasterController.js';

import express from 'express';

const router = express.Router();

router.get('/', getAllTestMastersController);
router.get('/:id', getTestMasterByIdController);
router.post('/', createTestMasterController);
router.put('/:id', updateTestMasterController);
router.delete('/:id', deleteTestMasterController);

export default router;