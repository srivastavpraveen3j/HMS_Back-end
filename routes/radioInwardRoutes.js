// routes/radioInwardRoutes.js
import express from 'express';
import radioInwardController, { upload } from '../controllers/radioInwardController.js';

const router = express.Router();

// Signature management
router.post('/:id/signature', upload.single('signatureFile'), radioInwardController.uploadSignature);

// ✅ Signature library routes
router.get('/signatures/:userId', radioInwardController.getUserSignatures);
router.post('/signatures', radioInwardController.saveUserSignature);
router.delete('/signatures/:id', radioInwardController.deleteUserSignature);

// Radio Inward Records
router.get('/', radioInwardController.getAllRecords);
router.post('/', radioInwardController.createRecord);
router.get('/search-similar', radioInwardController.searchSimilarReports);
router.get('/:id', radioInwardController.getRecordById);
router.put('/:id', radioInwardController.updateRecord);



// Template management
router.post('/templates', radioInwardController.createTemplate);
router.get('/templates/search', radioInwardController.getTemplatesByService);
router.put('/templates/:id', radioInwardController.updateTemplate);
router.delete('/templates/:id', radioInwardController.deleteTemplate);

export default router;
