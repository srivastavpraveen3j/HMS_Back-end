// routes/paymentProcessingRoutes.js

import express from 'express';
import {
  processSinglePayment,
  processBulkPayment,
  getPaymentHistory,
  getPaymentStatistics,
  getOverduePayments,
  cancelPayment,
  getPaymentById
} from '../controllers/paymentProcessingController.js';

const router = express.Router();

// Payment processing routes
router.post('/process/:invoiceId', processSinglePayment);
router.post('/bulk-payment', processBulkPayment);
router.get('/history', getPaymentHistory);
router.get('/statistics', getPaymentStatistics);
router.get('/overdue', getOverduePayments);
router.put('/cancel/:paymentId', cancelPayment);
router.get('/:paymentId', getPaymentById);

export default router;
