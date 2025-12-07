// controllers/invoiceVerificationController.js

import asyncHandler from '../utils/asyncWrapper.js';
import ErrorHandler from '../utils/CustomError.js';
import InvoiceVerification from '../models/invoiceVerification.js'; // ✅ FIXED: Capitalized and default import
import User from '../models/user.js';
import * as invoiceService from '../services/invoiceVerificationService.js';

// ✅ Create invoice verification
export const verifyInvoice = asyncHandler(async (req, res) => {
  const {
    grnId,
    poNumber,
    grnNumber,
    vendor,
    invoiceNo,
    invoiceDate,
    items,
    baseTotal,
    gstTotal,
    grandTotal,
    verifiedBy,
    remarks
  } = req.body;

  console.log('👤 User ID from request:', verifiedBy);
  console.log('📝 Request body keys:', Object.keys(req.body));

  // Validation
  if (!verifiedBy) {
    throw new ErrorHandler("User ID is required", 400);
  }

  if (!grnId || !invoiceNo || !invoiceDate || !items || items.length === 0) {
    throw new ErrorHandler("Required fields are missing", 400);
  }

  if (!vendor || !vendor.id || !vendor.name || !vendor.email) {
    throw new ErrorHandler("Vendor information is incomplete", 400);
  }

  try {
    console.log('🔍 Verifying user exists...');
    const user = await User.findById(verifiedBy);
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    console.log('✅ User verified:', user.name);
    console.log('📞 Calling invoice service...');

    // Process invoice verification
    const result = await invoiceService.verifyInvoice(req.body, verifiedBy);
    
    console.log('✅ Service returned result');
    console.log('Result type:', typeof result);
    console.log('Result keys:', result ? Object.keys(result) : 'null/undefined');

    if (!result) {
      throw new ErrorHandler("Invoice verification service returned no result", 500);
    }

    if (!result.invoiceVerification) {
      console.error('❌ Missing invoiceVerification in result:', result);
      throw new ErrorHandler("Invoice verification failed - invalid result structure", 500);
    }

    res.status(201).json({
      success: true,
      message: 'Invoice verified successfully and sent to accounts',
      data: {
        invoiceVerification: result.invoiceVerification,
        accountsEntry: result.accountsEntry
      },
      summary: {
        invoiceNo: result.invoiceVerification.invoiceNo,
        grnNumber: result.invoiceVerification.grnNumber,
        vendorName: result.invoiceVerification.vendor.name,
        totalAmount: result.invoiceVerification.grandTotal,
        itemsCount: result.invoiceVerification.items.length,
        status: result.invoiceVerification.status
      }
    });

  } catch (error) {
    console.error('❌ Invoice verification controller error:', error);
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error message:', error.message);
    
    if (error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(`Invoice verification failed: ${error.message}`, 500);
    }
  }
});

// ✅ Get verified invoices - FIXED
// ✅ Enhanced backend - handle empty date range
export const getVerifiedInvoices = asyncHandler(async (req, res) => {
  const { 
    vendorId, 
    fromDate, 
    toDate, 
    status, 
    paymentStatus, 
    page = 1, 
    limit = 10,
    // ✅ NEW: Search parameters
    vendorName,
    invoiceNo,
    grnNumber,
    poNumber
  } = req.query;
  
  console.log('📋 Getting verified invoices with params:', {
    vendorId, fromDate, toDate, status, paymentStatus, page, limit,
    vendorName, invoiceNo, grnNumber, poNumber
  });
  
  const filters = {};
  
  // Existing filters
  if (vendorId) filters['vendor.id'] = vendorId;
  
  // ✅ NEW: Search by Vendor Name
  if (vendorName && vendorName.trim()) {
    const vendorRegex = new RegExp(vendorName.trim(), 'i');
    filters['vendor.name'] = vendorRegex;
  }

  // ✅ NEW: Search by Invoice Number
  if (invoiceNo && invoiceNo.trim()) {
    const invoiceRegex = new RegExp(invoiceNo.trim(), 'i');
    filters.invoiceNo = invoiceRegex;
  }

  // ✅ NEW: Search by GRN Number
  if (grnNumber && grnNumber.trim()) {
    const grnRegex = new RegExp(grnNumber.trim(), 'i');
    filters.grnNumber = grnRegex;
  }

  // ✅ NEW: Search by PO Number
  if (poNumber && poNumber.trim()) {
    const poRegex = new RegExp(poNumber.trim(), 'i');
    filters.poNumber = poRegex;
  }
  
  // Date filtering (existing)
  if (fromDate && toDate && fromDate.trim() && toDate.trim()) {
    filters.verificationDate = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate + 'T23:59:59.999Z')
    };
    console.log('📅 Date filter applied:', filters.verificationDate);
  } else {
    console.log('📅 No date filter applied - showing all dates');
  }
  
  // Handle status filtering (existing)
  if (status && status.trim()) {
    filters.status = status;
  }
  
  // Handle payment status filtering (existing)
  if (paymentStatus && paymentStatus.trim()) {
    if (paymentStatus === 'pending') {
      filters.paymentStatus = { $in: ['pending', 'processing'] };
    } else if (paymentStatus === 'paid') {
      filters.paymentStatus = 'paid';
    } else {
      filters.paymentStatus = paymentStatus;
    }
  }

  console.log('🔍 Final invoice query filters:', JSON.stringify(filters, null, 2));

  try {
    // Get total count first
    const totalCount = await InvoiceVerification.countDocuments(filters);
    
    // Apply pagination to query
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const invoices = await InvoiceVerification.find(filters)
      .populate('verifiedBy', 'name email')
      .populate('paidBy', 'name email')
      .populate('grnId', 'grnNumber poNumber') // ✅ Added GRN population
      .sort({ verificationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log('📋 Found invoices:', invoices.length, 'of', totalCount, 'total');
    
    res.json({
      success: true,
      data: {
        invoices: invoices,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / parseInt(limit))
        },
        // ✅ NEW: Search metadata
        searchInfo: {
          vendorName: vendorName || '',
          invoiceNo: invoiceNo || '',
          grnNumber: grnNumber || '',
          poNumber: poNumber || '',
          totalResults: totalCount
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching verified invoices:', error);
    throw new ErrorHandler(`Failed to fetch verified invoices: ${error.message}`, 500);
  }
});



// ✅ Get invoice by ID - FIXED
export const getInvoiceById = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;

  if (!invoiceId) {
    throw new ErrorHandler("Invoice ID is required", 400);
  }

  try {
    // ✅ FIXED: Use model directly instead of service
    const invoice = await InvoiceVerification.findById(invoiceId)
      .populate('verifiedBy', 'name email')
      .populate('paidBy', 'name email')
      .populate('grnId', 'grnNumber poNumber items')
      .populate('accountsEntryId');

    if (!invoice) {
      throw new ErrorHandler("Invoice not found", 404);
    }

    res.json({
      success: true,
      data: invoice
    });

  } catch (error) {
    console.error('❌ Error fetching invoice:', error);
    throw new ErrorHandler(`Failed to fetch invoice: ${error.message}`, 500);
  }
});

// ✅ Update payment status - FIXED
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;
  const userId = req.user?._id;
  
  if (!userId) {
    throw new ErrorHandler("User authentication required", 401);
  }

  const { paymentMode, transactionId, paymentDate } = req.body;

  if (!paymentMode || !transactionId) {
    throw new ErrorHandler("Payment mode and transaction ID are required", 400);
  }

  try {
    // ✅ FIXED: Use model directly
    const updatedInvoice = await InvoiceVerification.findByIdAndUpdate(
      invoiceId,
      {
        paymentMode,
        transactionId,
        paymentDate: paymentDate || new Date(),
        paidBy: userId,
        paymentStatus: 'paid',
        status: 'payment_completed',
        updatedAt: new Date()
      },
      { new: true }
    ).populate('verifiedBy', 'name email')
     .populate('paidBy', 'name email');

    if (!updatedInvoice) {
      throw new ErrorHandler("Invoice not found", 404);
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: updatedInvoice,
      summary: {
        invoiceNo: updatedInvoice.invoiceNo,
        amount: updatedInvoice.grandTotal,
        paymentMode,
        transactionId,
        status: updatedInvoice.paymentStatus
      }
    });

  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    throw new ErrorHandler(`Failed to update payment status: ${error.message}`, 500);
  }
});

// ✅ Get invoice statistics - FIXED
export const getInvoiceStatistics = asyncHandler(async (req, res) => {
  const { fromDate, toDate } = req.query;

  try {
    const matchStage = {};
    
    if (fromDate && toDate) {
      matchStage.verificationDate = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate)
      };
    }

    // ✅ FIXED: Use model directly with aggregation
    const stats = await InvoiceVerification.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: '$grandTotal' },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$grandTotal', 0]
            }
          },
          pendingAmount: {
            $sum: {
              $cond: [{ $ne: ['$paymentStatus', 'paid'] }, '$grandTotal', 0]
            }
          },
          paidInvoices: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0]
            }
          },
          pendingInvoices: {
            $sum: {
              $cond: [{ $ne: ['$paymentStatus', 'paid'] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalInvoices: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        paidInvoices: 0,
        pendingInvoices: 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching invoice statistics:', error);
    throw new ErrorHandler(`Failed to fetch invoice statistics: ${error.message}`, 500);
  }
});

// ✅ Search invoices - FIXED
export const searchInvoices = asyncHandler(async (req, res) => {
  const { query, type = 'all' } = req.query;

  if (!query) {
    throw new ErrorHandler("Search query is required", 400);
  }

  try {
    const searchCriteria = {
      $or: [
        { invoiceNo: { $regex: query, $options: 'i' } },
        { grnNumber: { $regex: query, $options: 'i' } },
        { poNumber: { $regex: query, $options: 'i' } },
        { 'vendor.name': { $regex: query, $options: 'i' } }
      ]
    };

    if (type === 'pending') {
      searchCriteria.paymentStatus = { $in: ['pending', 'processing'] };
    } else if (type === 'paid') {
      searchCriteria.paymentStatus = 'paid';
    }

    // ✅ FIXED: Use correct model name
    const invoices = await InvoiceVerification.find(searchCriteria)
      .populate('verifiedBy', 'name email')
      .sort({ verificationDate: -1 })
      .limit(20);

    res.json({
      success: true,
      data: invoices,
      count: invoices.length
    });

  } catch (error) {
    console.error('❌ Error searching invoices:', error);
    throw new ErrorHandler(`Search failed: ${error.message}`, 500);
  }
});

// ✅ Debug endpoint to check all invoices
export const debugInvoices = asyncHandler(async (req, res) => {
  try {
    console.log('🔍 Debug: Fetching all invoices...');
    
    // ✅ FIXED: Use correct model name
    const allInvoices = await InvoiceVerification.find({})
      .select('invoiceNo status paymentStatus verificationDate paymentDate')
      .sort({ verificationDate: -1 });

    console.log('📋 Total invoices found:', allInvoices.length);

    const groupedByPaymentStatus = {
      pending: allInvoices.filter(inv => inv.paymentStatus === 'pending'),
      paid: allInvoices.filter(inv => inv.paymentStatus === 'paid'),
      processing: allInvoices.filter(inv => inv.paymentStatus === 'processing'),
      other: allInvoices.filter(inv => !['pending', 'paid', 'processing'].includes(inv.paymentStatus))
    };

    const groupedByStatus = {
      verified: allInvoices.filter(inv => inv.status === 'verified'),
      sent_to_accounts: allInvoices.filter(inv => inv.status === 'sent_to_accounts'),
      payment_completed: allInvoices.filter(inv => inv.status === 'payment_completed'),
      other: allInvoices.filter(inv => !['verified', 'sent_to_accounts', 'payment_completed'].includes(inv.status))
    };

    console.log('📊 Grouped by payment status:', {
      pending: groupedByPaymentStatus.pending.length,
      paid: groupedByPaymentStatus.paid.length,
      processing: groupedByPaymentStatus.processing.length,
      other: groupedByPaymentStatus.other.length
    });

    console.log('📊 Grouped by status:', {
      verified: groupedByStatus.verified.length,
      sent_to_accounts: groupedByStatus.sent_to_accounts.length,
      payment_completed: groupedByStatus.payment_completed.length,
      other: groupedByStatus.other.length
    });

    res.json({
      success: true,
      data: {
        total: allInvoices.length,
        groupedByPaymentStatus: {
          pending: groupedByPaymentStatus.pending.length,
          paid: groupedByPaymentStatus.paid.length,
          processing: groupedByPaymentStatus.processing.length,
          other: groupedByPaymentStatus.other.length
        },
        groupedByStatus: {
          verified: groupedByStatus.verified.length,
          sent_to_accounts: groupedByStatus.sent_to_accounts.length,
          payment_completed: groupedByStatus.payment_completed.length,
          other: groupedByStatus.other.length
        },
        sampleInvoices: allInvoices.slice(0, 5).map(inv => ({
          invoiceNo: inv.invoiceNo,
          status: inv.status,
          paymentStatus: inv.paymentStatus,
          verificationDate: inv.verificationDate,
          paymentDate: inv.paymentDate
        }))
      }
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});
