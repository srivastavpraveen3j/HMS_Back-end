// services/invoiceVerificationService.js

import mongoose from 'mongoose';
import InvoiceVerification from '../models/invoiceVerification.js';
import AccountsEntry from '../models/accountsEntry.js';
import GoodsReceiptNote from '../models/goodsReceiptNote.js';
import Counter from '../models/counter.js';
import { sendEmail } from '../utils/sendMail.js';
// services/invoiceVerificationService.js
import User from '../models/user.js';
// services/invoiceVerificationService.js

export const verifyInvoice = async (invoiceData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('📄 === INVOICE VERIFICATION SERVICE START ===');
    console.log('User ID:', userId);
    console.log('Invoice Data keys:', Object.keys(invoiceData));

    // ✅ Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    console.log('✅ User found:', user.name);

    // Validate GRN exists and is approved
    const grn = await GoodsReceiptNote.findById(invoiceData.grnId).session(session);
    if (!grn) {
      throw new Error('GRN not found');
    }
    console.log('✅ GRN found:', grn.grnNumber);

    if (grn.grnStatus !== 'approved') {
      throw new Error('Only approved GRNs can be invoiced');
    }

    if (grn.invoiceVerified) {
      throw new Error('Invoice already verified for this GRN');
    }

    // Check if invoice number already exists
    const existingInvoice = await InvoiceVerification.findOne({
      invoiceNo: invoiceData.invoiceNo
    }).session(session);

    if (existingInvoice) {
      throw new Error('Invoice number already exists');
    }

    // Calculate GST amounts for each item
    const processedItems = invoiceData.items.map(item => {
      const gstAmount = (item.baseAmount * item.gstPercent) / 100;
      const totalAmount = item.baseAmount + gstAmount;
      
      return {
        ...item,
        gstAmount,
        totalAmount
      };
    });

    console.log('✅ Processed items:', processedItems.length);

    // Create invoice verification record
    const invoiceVerificationData = {
      ...invoiceData,
      items: processedItems,
      verifiedBy: userId,
      verificationDate: new Date(),
      status: 'verified'
      // ❌ Remove any extra fields that don't belong:
      // Remove: accountsEntryId, paidBy (these are set later)
    };

    // ✅ Remove fields that shouldn't be in the initial creation
    delete invoiceVerificationData.accountsEntryId;
    delete invoiceVerificationData.paidBy;

    console.log('📝 Creating invoice verification with data:', {
      invoiceNo: invoiceVerificationData.invoiceNo,
      grnId: invoiceVerificationData.grnId,
      verifiedBy: invoiceVerificationData.verifiedBy,
      itemsCount: invoiceVerificationData.items.length
    });

    const [invoiceVerification] = await InvoiceVerification.create([invoiceVerificationData], { session });
    console.log('✅ Invoice verification created:', invoiceVerification._id);

    // Update GRN to mark as invoice verified
    await GoodsReceiptNote.findByIdAndUpdate(
      invoiceData.grnId,
      {
        invoiceVerified: true,
        invoiceNumber: invoiceData.invoiceNo,
        invoiceDate: new Date(invoiceData.invoiceDate),
        invoiceAmount: invoiceVerification.grandTotal,
        invoiceVerificationId: invoiceVerification._id
      },
      { session }
    );
    console.log('✅ GRN updated');

    // Create accounts entry
    const accountsEntry = await createAccountsEntry(invoiceVerification, userId, session);
    console.log('✅ Accounts entry created:', accountsEntry._id);

    // Update invoice with accounts entry reference
    invoiceVerification.accountsEntryId = accountsEntry._id;
    invoiceVerification.status = 'sent_to_accounts';
    await invoiceVerification.save({ session });
    console.log('✅ Invoice updated with accounts entry');

    await session.commitTransaction();
    console.log('✅ Transaction committed');

    const result = {
      invoiceVerification,
      accountsEntry,
      grn
    };

    console.log('📄 === SERVICE RETURNING RESULT ===');
    console.log('Result keys:', Object.keys(result));
    console.log('Invoice verification ID:', result.invoiceVerification?._id);

    return result;

  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Invoice verification failed:', error);
    console.error('❌ Error stack:', error.stack);
    throw error;
  } finally {
    session.endSession();
  }
};


// Create accounts entry for invoice verification
const createAccountsEntry = async (invoiceVerification, userId, session) => {
  try {
    const accountsEntryData = {
      entryType: 'invoice_verification',
      referenceType: 'invoice_verification',
      referenceId: invoiceVerification._id,
      referenceModel: 'InvoiceVerification',
      referenceNumber: invoiceVerification.invoiceNo,
      
      amount: invoiceVerification.grandTotal,
      
      // Accounting entries (Accounts Payable)
      debitAccount: {
        accountCode: '5000', // Purchases/Inventory
        accountName: 'Purchases Account',
        amount: invoiceVerification.grandTotal
      },
      creditAccount: {
        accountCode: '2100', // Accounts Payable
        accountName: 'Accounts Payable',
        amount: invoiceVerification.grandTotal
      },
      
      vendor: {
        id: invoiceVerification.vendor.id,
        name: invoiceVerification.vendor.name,
        code: `VEN-${invoiceVerification.vendor.id.toString().slice(-6).toUpperCase()}`
      },
      
      transactionDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      
      status: 'approved',
      createdBy: userId,
      approvedBy: userId,
      approvalDate: new Date(),
      
      description: `Invoice verification for GRN ${invoiceVerification.grnNumber} from ${invoiceVerification.vendor.name}`,
      remarks: `Auto-generated from invoice verification ${invoiceVerification.invoiceNo}`,
      
      auditLog: [{
        action: 'created',
        performedBy: userId,
        performedAt: new Date(),
        remarks: 'Auto-created from invoice verification'
      }]
    };

    const [accountsEntry] = await AccountsEntry.create([accountsEntryData], { session });
    
    console.log('✅ Accounts entry created:', accountsEntry.entryNumber);
    return accountsEntry;

  } catch (error) {
    console.error('❌ Accounts entry creation failed:', error);
    throw error;
  }
};

// Send email notification
const sendInvoiceVerificationEmail = async (invoiceVerification) => {
  try {
    const templateVars = {
      invoiceNo: invoiceVerification.invoiceNo,
      grnNumber: invoiceVerification.grnNumber,
      vendorName: invoiceVerification.vendor.name,
      grandTotal: invoiceVerification.grandTotal,
      itemCount: invoiceVerification.items.length,
      verificationDate: invoiceVerification.verificationDate.toLocaleDateString()
    };

    // Send to vendor
    if (invoiceVerification.vendor.email) {
      await sendEmail(invoiceVerification.vendor.email, 'invoice_verified', templateVars);
    }

    // Send to accounts team (if configured)
    // await sendEmail('accounts@company.com', 'invoice_verified_accounts', templateVars);

    console.log('✅ Invoice verification email sent');

  } catch (error) {
    console.error('📧 Email sending failed:', error);
    throw error;
  }
};

// Get verified invoices for payment processing
export const getVerifiedInvoices = async (filters = {}) => {
  try {
    const query = {
      status: { $in: ['verified', 'sent_to_accounts'] },
      paymentStatus: 'pending'
    };

    // Apply existing filters
    if (filters.vendorId) {
      query['vendor.id'] = filters.vendorId;
    }

    // ✅ NEW: Search filters
    if (filters.vendorName) {
      const vendorRegex = new RegExp(filters.vendorName, 'i');
      query['vendor.name'] = vendorRegex;
    }

    if (filters.invoiceNo) {
      const invoiceRegex = new RegExp(filters.invoiceNo, 'i');
      query.invoiceNo = invoiceRegex;
    }

    if (filters.grnNumber) {
      const grnRegex = new RegExp(filters.grnNumber, 'i');
      query.grnNumber = grnRegex;
    }

    if (filters.poNumber) {
      const poRegex = new RegExp(filters.poNumber, 'i');
      query.poNumber = poRegex;
    }

    if (filters.fromDate && filters.toDate) {
      query.verificationDate = {
        $gte: new Date(filters.fromDate),
        $lte: new Date(filters.toDate)
      };
    }

    console.log('🔍 Service query filters:', JSON.stringify(query, null, 2));

    const invoices = await InvoiceVerification.find(query)
      .populate('verifiedBy', 'name email')
      .populate('grnId', 'grnNumber poNumber')
      .sort({ verificationDate: -1 });

    return invoices;

  } catch (error) {
    console.error('❌ Error fetching verified invoices:', error);
    throw error;
  }
};


// Get invoice by ID
export const getInvoiceById = async (invoiceId) => {
  try {
    const invoice = await InvoiceVerification.findById(invoiceId)
      .populate('verifiedBy', 'name email')
      .populate('paidBy', 'name email')
      .populate('grnId', 'grnNumber poNumber items')
      .populate('accountsEntryId');

    return invoice;

  } catch (error) {
    console.error('❌ Error fetching invoice:', error);
    throw error;
  }
};

// Update payment status
export const updatePaymentStatus = async (invoiceId, paymentData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const invoice = await InvoiceVerification.findById(invoiceId).session(session);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Update payment details
    invoice.paymentStatus = 'paid';
    invoice.paymentDate = paymentData.paymentDate || new Date();
    invoice.paymentMode = paymentData.paymentMode;
    invoice.transactionId = paymentData.transactionId;
    invoice.paidBy = userId;
    invoice.status = 'payment_completed';

    await invoice.save({ session });

    // Update accounts entry
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
              remarks: `Payment received via ${paymentData.paymentMode}. Transaction ID: ${paymentData.transactionId}`
            }
          }
        },
        { session }
      );
    }

    await session.commitTransaction();

    console.log('✅ Payment status updated for invoice:', invoice.invoiceNo);
    return invoice;

  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Payment status update failed:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

// Get invoice statistics
export const getInvoiceStatistics = async (filters = {}) => {
  try {
    const matchStage = {};
    
    if (filters.fromDate && filters.toDate) {
      matchStage.verificationDate = {
        $gte: new Date(filters.fromDate),
        $lte: new Date(filters.toDate)
      };
    }

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
              $cond: [{ $eq: ['$paymentStatus', 'pending'] }, '$grandTotal', 0]
            }
          },
          paidInvoices: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0]
            }
          },
          pendingInvoices: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0]
            }
          }
        }
      }
    ]);

    return stats[0] || {
      totalInvoices: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      paidInvoices: 0,
      pendingInvoices: 0
    };

  } catch (error) {
    console.error('❌ Error fetching invoice statistics:', error);
    throw error;
  }
};
