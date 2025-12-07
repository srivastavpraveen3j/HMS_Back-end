// models/accountsEntry.js

import mongoose from 'mongoose';

const accountsEntrySchema = new mongoose.Schema({
  // Entry Details
  entryType: {
    type: String,
    enum: ['invoice_verification', 'payment_processing', 'expense', 'income', 'adjustment'],
    required: true
  },
//   entryNumber: {
//     type: String,
//     unique: true,
//     required: true
//   },
  
  // Reference Documents
  referenceType: {
    type: String,
    enum: ['invoice_verification', 'purchase_order', 'grn', 'payment', 'other'],
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    required: true,
    enum: ['InvoiceVerification', 'PurchaseOrder', 'GoodsReceiptNote', 'Payment']
  },
  referenceNumber: {
    type: String,
    required: true
  },
  
  // Financial Details
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Account Classifications
  debitAccount: {
    accountCode: {
      type: String,
      required: true
    },
    accountName: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  },
  creditAccount: {
    accountCode: {
      type: String,
      required: true
    },
    accountName: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  },
  
  // Vendor/Supplier Information
  vendor: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    },
    name: String,
    code: String
  },
  
  // Transaction Details
  transactionDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date
  },
  
  // Status Management
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'posted', 'cancelled'],
    default: 'draft'
  },
  
  // Approval Workflow
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  
  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'overdue'],
    default: 'unpaid'
  },
  paymentDueDate: {
    type: Date
  },
  paymentTerms: {
    type: String,
    default: 'Net 30'
  },
  
  // Additional Information
  description: {
    type: String,
    required: true
  },
  remarks: {
    type: String
  },
  tags: [String],
  
  // Audit Trail
  auditLog: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'approved', 'posted', 'cancelled', 'payment_received']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    remarks: String
  }]
  
}, {
  timestamps: true,
  collection: 'accounts_entries',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
accountsEntrySchema.virtual('isOverdue').get(function() {
  if (this.paymentDueDate && this.paymentStatus !== 'paid') {
    return new Date() > this.paymentDueDate;
  }
  return false;
});

accountsEntrySchema.virtual('daysOverdue').get(function() {
  if (this.isOverdue) {
    const diffTime = Math.abs(new Date() - new Date(this.paymentDueDate));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Pre-save middleware
accountsEntrySchema.pre('save', function(next) {
  // Validate debit and credit balance
  if (Math.abs(this.debitAccount.amount - this.creditAccount.amount) > 0.01) {
    return next(new Error('Debit and Credit amounts must be equal'));
  }
  
  // Auto-generate entry number if not provided
  if (!this.entryNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    this.entryNumber = `AE/${month}${year}/${timestamp}`;
  }
  
  next();
});

// Indexes
accountsEntrySchema.index({ entryNumber: 1 });
accountsEntrySchema.index({ referenceId: 1, referenceType: 1 });
accountsEntrySchema.index({ status: 1 });
accountsEntrySchema.index({ paymentStatus: 1 });
accountsEntrySchema.index({ transactionDate: -1 });
accountsEntrySchema.index({ 'vendor.id': 1 });

export default mongoose.model('AccountsEntry', accountsEntrySchema);
