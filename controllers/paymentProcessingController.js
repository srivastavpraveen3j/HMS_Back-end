// controllers/paymentProcessingController.js

import asyncHandler from '../utils/asyncWrapper.js';
import ErrorHandler from '../utils/CustomError.js';
import User from '../models/user.js';
import * as paymentService from '../services/paymentProcessingService.js';

// Process single payment
// controllers/paymentProcessingController.js

export const processSinglePayment = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;
  const {
    paymentMode,
    transactionId,
    paymentDate,
    remarks,
    bankDetails,
    userId
  } = req.body;

  console.log('👤 User ID from request:', userId);
  console.log('💰 Processing payment for invoice:', invoiceId);
  console.log('📝 Payment data received:', { paymentMode, transactionId, paymentDate });

  // Validation
  if (!userId) {
    throw new ErrorHandler("User ID is required", 400);
  }

  if (!paymentMode || !transactionId || !paymentDate) {
    throw new ErrorHandler("Payment mode, transaction ID, and payment date are required", 400);
  }

  if (!invoiceId) {
    throw new ErrorHandler("Invoice ID is required", 400);
  }

  try {
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    console.log('✅ User verified:', user.name);

    // Process payment
    const result = await paymentService.processSinglePayment(
      invoiceId,
      { paymentMode, transactionId, paymentDate, remarks, bankDetails },
      userId
    );

    console.log('✅ Payment processed successfully');

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: result.payment,
      summary: {
        paymentId: result.payment.paymentId,
        invoiceNo: result.payment.invoiceNo,
        amount: result.payment.amount,
        transactionId: result.payment.transactionId,
        status: result.payment.status
      }
    });

  } catch (error) {
    console.error('❌ Payment processing error:', error);
    throw new ErrorHandler(`Payment processing failed: ${error.message}`, 500);
  }
});


// Process bulk payment
export const processBulkPayment = asyncHandler(async (req, res) => {
  const {
    invoiceIds,
    paymentMode,
    transactionId,
    paymentDate,
    remarks,
    bankDetails,
    userId
  } = req.body;

  console.log('👤 User ID:', userId);
  console.log('💰 Processing bulk payment for invoices:', invoiceIds?.length);

  // Validation
  if (!userId) {
    throw new ErrorHandler("User ID is required", 400);
  }

  if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
    throw new ErrorHandler("Invoice IDs array is required", 400);
  }

  if (!paymentMode || !transactionId || !paymentDate) {
    throw new ErrorHandler("Payment mode, transaction ID, and payment date are required", 400);
  }

  try {
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    console.log('✅ User verified:', user.name);

    // Process bulk payment
    const result = await paymentService.processBulkPayment(
      invoiceIds,
      { paymentMode, transactionId, paymentDate, remarks, bankDetails },
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Bulk payment processed successfully',
      data: result.payments,
      summary: {
        processedCount: result.count,
        totalAmount: result.totalAmount,
        transactionId,
        status: 'completed'
      }
    });

  } catch (error) {
    console.error('❌ Bulk payment processing error:', error);
    throw new ErrorHandler(`Bulk payment processing failed: ${error.message}`, 500);
  }
});

// Get payment history
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    paymentMode,
    vendorId,
    fromDate,
    toDate,
    search
  } = req.query;

  try {
    const filters = {
      status,
      paymentMode,
      vendorId,
      fromDate,
      toDate,
      search
    };

    const payments = await paymentService.getPaymentHistory(filters);

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPayments = payments.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        payments: paginatedPayments,
        pagination: {
          total: payments.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(payments.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching payment history:', error);
    throw new ErrorHandler(`Failed to fetch payment history: ${error.message}`, 500);
  }
});

// Get payment statistics
export const getPaymentStatistics = asyncHandler(async (req, res) => {
  const { fromDate, toDate } = req.query;

  try {
    const filters = { fromDate, toDate };
    const stats = await paymentService.getPaymentStatistics(filters);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error fetching payment statistics:', error);
    throw new ErrorHandler(`Failed to fetch payment statistics: ${error.message}`, 500);
  }
});

// Get overdue payments
export const getOverduePayments = asyncHandler(async (req, res) => {
  try {
    const overduePayments = await paymentService.getOverduePayments();

    res.json({
      success: true,
      data: overduePayments,
      count: overduePayments.length
    });

  } catch (error) {
    console.error('❌ Error fetching overdue payments:', error);
    throw new ErrorHandler(`Failed to fetch overdue payments: ${error.message}`, 500);
  }
});

// Cancel payment
export const cancelPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { reason, userId } = req.body;

  if (!userId) {
    throw new ErrorHandler("User ID is required", 400);
  }

  if (!reason) {
    throw new ErrorHandler("Cancellation reason is required", 400);
  }

  try {
    const cancelledPayment = await paymentService.cancelPayment(paymentId, reason, userId);

    res.json({
      success: true,
      message: 'Payment cancelled successfully',
      data: cancelledPayment
    });

  } catch (error) {
    console.error('❌ Error cancelling payment:', error);
    throw new ErrorHandler(`Failed to cancel payment: ${error.message}`, 500);
  }
});

// Get payment by ID
export const getPaymentById = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  try {
    const payment = await Payment.findById(paymentId)
      .populate('processedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('invoiceVerificationId');

    if (!payment) {
      throw new ErrorHandler("Payment not found", 404);
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('❌ Error fetching payment:', error);
    throw new ErrorHandler(`Failed to fetch payment: ${error.message}`, 500);
  }
});
