// routes/invoiceVerificationRoutes.js

import express from 'express';
import {
  verifyInvoice,
  getVerifiedInvoices,
  getInvoiceById,
  updatePaymentStatus,
  getInvoiceStatistics,
  searchInvoices
} from '../controllers/invoiceVerificationController.js';

const router = express.Router();

// ✅ Remove authentication middleware for testing
router.post('/verify', verifyInvoice);
router.get('/verified', getVerifiedInvoices);
router.get('/search', searchInvoices);
router.get('/statistics', getInvoiceStatistics);
router.get('/:invoiceId', getInvoiceById);
router.put('/:invoiceId/payment', updatePaymentStatus);

export default router;
