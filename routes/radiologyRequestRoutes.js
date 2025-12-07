// routes/radiologyRequestRoutes.js
import express from 'express';
import radiologyRequestController from '../controllers/radiologyRequestController.js';

const router = express.Router();

// Get all radiology requests
router.get('/', radiologyRequestController.getAllRequests);

// Get pending requests
router.get('/pending', radiologyRequestController.getPendingRequests);

router.post('/', radiologyRequestController.createRequest);

// Get single radiology request
router.get('/:id', radiologyRequestController.getRequestById);

// Assign technician
router.put('/:id/assign-technician', radiologyRequestController.assignTechnician);

// Update service status
router.put('/:id/services/:serviceId/status', radiologyRequestController.updateServiceStatus);

export default router;
