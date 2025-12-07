// models/invoiceVerification.js

import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  quantityPassed: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price must be positive']
  },
  baseAmount: {
    type: Number,
    required: true,
    min: [0, 'Base amount must be positive']
  },
  gstPercent: {
    type: Number,
    // required: true,
    min: [0, 'GST percent cannot be negative'],
    max: [28, 'GST percent cannot exceed 28%']
  },
  gstAmount: {
    type: Number,
    // required: true,
    min: [0, 'GST amount must be positive']
  },
  totalAmount: {
    type: Number,
    // required: true,
    min: [0, 'Total amount must be positive']
  }
}, { _id: true });

const invoiceVerificationSchema = new mongoose.Schema({
  // Invoice Details
  invoiceNo: {
    type: String,
    required: [true, 'Invoice number is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  invoiceDate: {
    type: Date,
    required: [true, 'Invoice date is required']
  },
  
  // GRN Reference
  grnId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GoodsReceiptNote',
    required: [true, 'GRN reference is required']
  },
  grnNumber: {
    type: String,
    required: [true, 'GRN number is required']
  },
  
  // PO Reference
  poNumber: {
    type: String,
    required: [true, 'PO number is required']
  },
  
  // Vendor Information
  vendor: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String
    }
  },
  
  // Invoice Items
  items: [invoiceItemSchema],
  
  // Financial Summary
  baseTotal: {
    type: Number,
    required: true,
    min: [0, 'Base total must be positive']
  },
  gstTotal: {
    type: Number,
    required: true,
    min: [0, 'GST total must be positive']
  },
  grandTotal: {
    type: Number,
    required: true,
    min: [0, 'Grand total must be positive']
  },
  
  // Verification Details
  verificationDate: {
    type: Date,
    default: Date.now
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Status Management
  status: {
    type: String,
    enum: ['verified', 'sent_to_accounts', 'payment_pending', 'payment_completed', 'cancelled'],
    default: 'verified'
  },
  
  // Payment Status
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  },
  paymentMode: {
    type: String,
    enum: ['cheque', 'neft', 'rtgs', 'upi', 'cash', 'other']
  },
  transactionId: {
    type: String
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Accounts Integration
  accountsEntryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Additional Fields
  remarks: {
    type: String
  },
  attachments: [{
    fileName: String,
    filePath: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
  
}, {
  timestamps: true,
    collection: 'invoice_verifications', // ✅ Explicit collection name
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
invoiceVerificationSchema.virtual('totalItems').get(function() {
  return this.items?.length || 0;
});

invoiceVerificationSchema.virtual('daysFromInvoice').get(function() {
  const diffTime = Math.abs(new Date() - new Date(this.invoiceDate));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
invoiceVerificationSchema.pre('save', function(next) {
  // Auto-calculate totals
  if (this.items && this.items.length > 0) {
    this.baseTotal = this.items.reduce((sum, item) => sum + item.baseAmount, 0);
    this.gstTotal = this.items.reduce((sum, item) => sum + item.gstAmount, 0);
    this.grandTotal = this.baseTotal + this.gstTotal;
  }
  
  // Auto-update status based on payment
  if (this.paymentStatus === 'paid' && this.status !== 'payment_completed') {
    this.status = 'payment_completed';
  }
  
  next();
});

// Indexes
invoiceVerificationSchema.index({ invoiceNo: 1 });
invoiceVerificationSchema.index({ grnId: 1 });
invoiceVerificationSchema.index({ grnNumber: 1 });
invoiceVerificationSchema.index({ status: 1 });
invoiceVerificationSchema.index({ paymentStatus: 1 });
invoiceVerificationSchema.index({ 'vendor.id': 1 });
invoiceVerificationSchema.index({ verificationDate: -1 });

export default mongoose.model('InvoiceVerification', invoiceVerificationSchema);
