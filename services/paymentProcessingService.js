// services/paymentProcessingService.js

import mongoose from 'mongoose';
import Payment from '../models/payment.js';
import InvoiceVerification from '../models/invoiceVerification.js';
import AccountsEntry from '../models/accountsEntry.js';
import User from '../models/user.js';
import { sendEmail } from '../utils/sendMail.js';

// Process single payment
// services/paymentProcessingService.js

// Process single payment
export const processSinglePayment = async (invoiceId, paymentData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('💰 === PAYMENT PROCESSING SERVICE START ===');
    console.log('Invoice ID:', invoiceId);
    console.log('Payment Data:', paymentData);
    console.log('User ID:', userId);

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get invoice verification record
    const invoice = await InvoiceVerification.findById(invoiceId).session(session);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.paymentStatus === 'paid') {
      throw new Error('Invoice already paid');
    }

    // Check if payment already exists for this invoice
    const existingPayment = await Payment.findOne({
      invoiceVerificationId: invoiceId,
      status: { $in: ['initiated', 'processing', 'completed'] }
    }).session(session);

    if (existingPayment) {
      throw new Error('Payment already exists for this invoice');
    }

    // ✅ Create payment record WITHOUT paymentId (let pre-save handle it)
    const paymentRecord = {
      // ❌ DON'T SET paymentId here - let pre-save middleware handle it
      invoiceVerificationId: invoice._id,
      invoiceNo: invoice.invoiceNo,
      grnNumber: invoice.grnNumber,
      vendor: {
        id: invoice.vendor.id,
        name: invoice.vendor.name,
        email: invoice.vendor.email,
        accountDetails: paymentData.bankDetails || {}
      },
      amount: invoice.grandTotal,
      paymentMode: paymentData.paymentMode,
      transactionId: paymentData.transactionId,
      paymentDate: new Date(paymentData.paymentDate),
      processedBy: userId,
      status: 'processing',
      remarks: paymentData.remarks,
      bankDetails: paymentData.bankDetails || {},
      auditLog: [{
        action: 'initiated',
        performedBy: userId,
        performedAt: new Date(),
        remarks: 'Payment initiated',
        previousStatus: 'pending',
        newStatus: 'processing'
      }]
    };

    console.log('📝 Creating payment record:', {
      invoiceNo: paymentRecord.invoiceNo,
      amount: paymentRecord.amount,
      paymentMode: paymentRecord.paymentMode
    });

    const [payment] = await Payment.create([paymentRecord], { session });
    console.log('✅ Payment record created with ID:', payment.paymentId);

    // Update invoice verification record
    await InvoiceVerification.findByIdAndUpdate(
      invoiceId,
      {
        paymentStatus: 'paid',
        paymentDate: new Date(paymentData.paymentDate),
        paymentMode: paymentData.paymentMode,
        transactionId: paymentData.transactionId,
        paidBy: userId,
        status: 'payment_completed'
      },
      { session }
    );
    console.log('✅ Invoice updated to paid status');

    // Update accounts entry if exists
    if (invoice.accountsEntryId) {
      await AccountsEntry.findByIdAndUpdate(
        invoice.accountsEntryId,
        {
          paymentStatus: 'paid',
          $push: {
            auditLog: {
              action: 'payment_received',
              performedBy: userId,
              performedAt: new Date(),
              remarks: `Payment completed via ${paymentData.paymentMode}. Transaction: ${paymentData.transactionId}`
            }
          }
        },
        { session }
      );
      console.log('✅ Accounts entry updated');
    }

    // Mark payment as completed
    payment.status = 'completed';
    payment.completedDate = new Date();
    payment.auditLog.push({
      action: 'completed',
      performedBy: userId,
      performedAt: new Date(),
      remarks: 'Payment completed successfully',
      previousStatus: 'processing',
      newStatus: 'completed'
    });
    await payment.save({ session });

    await session.commitTransaction();

    console.log('✅ Payment processing completed successfully');

    return {
      payment,
      invoice,
      message: 'Payment processed successfully'
    };

  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Payment processing failed:', error);
    throw error;
  } finally {
    session.endSession();
  }
};


// Process bulk payment
export const processBulkPayment = async (invoiceIds, paymentData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('💰 === BULK PAYMENT PROCESSING START ===');
    console.log('Invoice IDs:', invoiceIds);
    console.log('User ID:', userId);

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get all invoices
    const invoices = await InvoiceVerification.find({
      _id: { $in: invoiceIds },
      paymentStatus: 'pending'
    }).session(session);

    if (invoices.length === 0) {
      throw new Error('No valid invoices found for payment');
    }

    if (invoices.length !== invoiceIds.length) {
      throw new Error('Some invoices are already paid or not found');
    }

    const payments = [];
    const processedInvoices = [];

    // Process each invoice
    for (const invoice of invoices) {
      // Create payment record
      const paymentRecord = {
        invoiceVerificationId: invoice._id,
        invoiceNo: invoice.invoiceNo,
        grnNumber: invoice.grnNumber,
        vendor: {
          id: invoice.vendor.id,
          name: invoice.vendor.name,
          email: invoice.vendor.email,
          accountDetails: paymentData.bankDetails || {}
        },
        amount: invoice.grandTotal,
        paymentMode: paymentData.paymentMode,
        transactionId: `${paymentData.transactionId}-${invoice.invoiceNo}`,
        paymentDate: new Date(paymentData.paymentDate),
        processedBy: userId,
        status: 'completed',
        completedDate: new Date(),
        remarks: `${paymentData.remarks} (Bulk Payment)`,
        bankDetails: paymentData.bankDetails || {},
        auditLog: [{
          action: 'initiated',
          performedBy: userId,
          performedAt: new Date(),
          remarks: 'Bulk payment initiated',
          previousStatus: 'pending',
          newStatus: 'processing'
        }, {
          action: 'completed',
          performedBy: userId,
          performedAt: new Date(),
          remarks: 'Bulk payment completed',
          previousStatus: 'processing',
          newStatus: 'completed'
        }]
      };

      const [payment] = await Payment.create([paymentRecord], { session });
      payments.push(payment);

      // Update invoice
      await InvoiceVerification.findByIdAndUpdate(
        invoice._id,
        {
          paymentStatus: 'paid',
          paymentDate: new Date(paymentData.paymentDate),
          paymentMode: paymentData.paymentMode,
          transactionId: payment.transactionId,
          paidBy: userId,
          status: 'payment_completed'
        },
        { session }
      );

      // Update accounts entry if exists
      if (invoice.accountsEntryId) {
        await AccountsEntry.findByIdAndUpdate(
          invoice.accountsEntryId,
          {
            paymentStatus: 'paid',
            $push: {
              auditLog: {
                action: 'payment_received',
                performedBy: userId,
                performedAt: new Date(),
                remarks: `Bulk payment completed. Transaction: ${payment.transactionId}`
              }
            }
          },
          { session }
        );
      }

      processedInvoices.push(invoice);
    }

    await session.commitTransaction();

    // Send email notifications (outside transaction)
    try {
      for (const payment of payments) {
        const invoice = processedInvoices.find(inv => inv._id.equals(payment.invoiceVerificationId));
        await sendPaymentNotificationEmails(payment, invoice, user);
      }
    } catch (emailError) {
      console.error('📧 Email notifications failed:', emailError);
    }

    return {
      payments,
      processedInvoices,
      totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
      count: payments.length,
      message: 'Bulk payment processed successfully'
    };

  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Bulk payment processing failed:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

// Get payment history
export const getPaymentHistory = async (filters = {}) => {
  try {
    const query = {};

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.paymentMode) {
      query.paymentMode = filters.paymentMode;
    }

    if (filters.vendorId) {
      query['vendor.id'] = filters.vendorId;
    }

    if (filters.fromDate && filters.toDate) {
      query.paymentDate = {
        $gte: new Date(filters.fromDate),
        $lte: new Date(filters.toDate)
      };
    }

    if (filters.search) {
      query.$or = [
        { paymentId: { $regex: filters.search, $options: 'i' } },
        { invoiceNo: { $regex: filters.search, $options: 'i' } },
        { transactionId: { $regex: filters.search, $options: 'i' } },
        { 'vendor.name': { $regex: filters.search, $options: 'i' } }
      ];
    }

    const payments = await Payment.find(query)
      .populate('processedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('invoiceVerificationId', 'invoiceNo grnNumber poNumber')
      .sort({ paymentDate: -1 });

    return payments;

  } catch (error) {
    console.error('❌ Error fetching payment history:', error);
    throw error;
  }
};

// Get payment statistics
export const getPaymentStatistics = async (filters = {}) => {
  try {
    const matchStage = {};

    if (filters.fromDate && filters.toDate) {
      matchStage.paymentDate = {
        $gte: new Date(filters.fromDate),
        $lte: new Date(filters.toDate)
      };
    }

    const stats = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          completedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
          },
          processingPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          processingAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, '$amount', 0] }
          },
          failedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          failedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, '$amount', 0] }
          }
        }
      }
    ]);

    // Get payment mode statistics
    const paymentModeStats = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$paymentMode',
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    return {
      summary: stats[0] || {
        totalPayments: 0,
        totalAmount: 0,
        completedPayments: 0,
        completedAmount: 0,
        processingPayments: 0,
        processingAmount: 0,
        failedPayments: 0,
        failedAmount: 0
      },
      paymentModes: paymentModeStats
    };

  } catch (error) {
    console.error('❌ Error fetching payment statistics:', error);
    throw error;
  }
};

// Send payment notification emails
const sendPaymentNotificationEmails = async (payment, invoice, user) => {
  try {
    const templateVars = {
      paymentId: payment.paymentId,
      invoiceNo: payment.invoiceNo,
      vendorName: payment.vendor.name,
      amount: payment.amount,
      paymentMode: payment.paymentMode.toUpperCase(),
      transactionId: payment.transactionId,
      paymentDate: payment.paymentDate.toLocaleDateString(),
      processedBy: user.name
    };

    // Send to vendor
    if (payment.vendor.email) {
      await sendEmail(payment.vendor.email, 'payment_completed', templateVars);
    }

    // Send to accounts team
    // await sendEmail('accounts@company.com', 'payment_processed', templateVars);

    console.log('✅ Payment notification emails sent');

  } catch (error) {
    console.error('📧 Email sending failed:', error);
    throw error;
  }
};

// Get overdue payments
export const getOverduePayments = async () => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const overduePayments = await Payment.find({
      status: 'processing',
      initiatedDate: { $lt: threeDaysAgo }
    })
      .populate('processedBy', 'name email')
      .populate('invoiceVerificationId', 'invoiceNo grnNumber')
      .sort({ initiatedDate: 1 });

    return overduePayments;

  } catch (error) {
    console.error('❌ Error fetching overdue payments:', error);
    throw error;
  }
};

// Cancel payment
export const cancelPayment = async (paymentId, reason, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status === 'completed') {
      throw new Error('Cannot cancel completed payment');
    }

    // Update payment status
    payment.status = 'cancelled';
    payment.failureReason = reason;
    payment.auditLog.push({
      action: 'cancelled',
      performedBy: userId,
      performedAt: new Date(),
      remarks: reason,
      previousStatus: payment.status,
      newStatus: 'cancelled'
    });
    await payment.save({ session });

    // Update invoice back to pending
    await InvoiceVerification.findByIdAndUpdate(
      payment.invoiceVerificationId,
      {
        paymentStatus: 'pending',
        status: 'sent_to_accounts',
        $unset: {
          paymentDate: 1,
          paymentMode: 1,
          transactionId: 1,
          paidBy: 1
        }
      },
      { session }
    );

    await session.commitTransaction();

    return payment;

  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Payment cancellation failed:', error);
    throw error;
  } finally {
    session.endSession();
  }
  
};


