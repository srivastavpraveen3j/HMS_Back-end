// models/payment.js

import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Payment Reference
  paymentId: {
    type: String,
    unique: true,
    // ❌ REMOVE required: true - let pre-save middleware handle this
  },
  
  // Invoice References
  invoiceVerificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InvoiceVerification',
    required: true
  },
  invoiceNo: {
    type: String,
    required: true
  },
  grnNumber: {
    type: String,
    required: true
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
    accountDetails: {
      bankName: String,
      accountNumber: String,
      ifscCode: String,
      branchName: String,
      accountHolderName: String
    }
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true,
    min: [0, 'Payment amount must be positive']
  },
  paymentMode: {
    type: String,
    enum: ['neft', 'rtgs', 'upi', 'cheque', 'cash', 'other', 'petipayment'],
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  referenceNumber: {
    type: String
  },
  
  // Dates
  paymentDate: {
    type: Date,
    required: true
  },
  initiatedDate: {
    type: Date,
    default: Date.now
  },
  completedDate: {
    type: Date
  },
  
  // Status Management
  status: {
    type: String,
    enum: ['initiated', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'initiated'
  },
  
  // Payment Processing
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Bank Details
  bankDetails: {
    payerBank: String,
    payeeBank: String,
    chequenNumber: String,
    clearanceDate: Date,
    bankCharges: {
      type: Number,
      default: 0
    }
  },
  
  // Additional Information
  remarks: {
    type: String
  },
  internalNotes: {
    type: String
  },
  
  // Attachments
  attachments: [{
    fileName: String,
    filePath: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Audit Trail
  auditLog: [{
    action: {
      type: String,
      enum: ['initiated', 'approved', 'processing', 'completed', 'failed', 'cancelled', 'refunded']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    remarks: String,
    previousStatus: String,
    newStatus: String
  }],
  
  // Failure Information
  failureReason: {
    type: String
  },
  retryCount: {
    type: Number,
    default: 0
  },
  
  // Financial Reconciliation
  reconciled: {
    type: Boolean,
    default: false
  },
  reconciledDate: {
    type: Date
  },
  reconciledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
paymentSchema.virtual('daysSinceInitiated').get(function() {
  const diffTime = Math.abs(new Date() - new Date(this.initiatedDate));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

paymentSchema.virtual('isOverdue').get(function() {
  return this.status === 'processing' && this.daysSinceInitiated > 3;
});

// ✅ FIXED Pre-save middleware
paymentSchema.pre('save', async function(next) {
  try {
    // ✅ Generate payment ID if not provided
    if (!this.paymentId) {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      // Get count for today to ensure uniqueness
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      
      const todayCount = await mongoose.model('Payment').countDocuments({
        createdAt: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      });
      
      const sequence = String(todayCount + 1).padStart(4, '0');
      this.paymentId = `PAY/${day}${month}${year}/${sequence}`;
      
      console.log('✅ Generated Payment ID:', this.paymentId);
    }
    
    // Update completed date when status changes to completed
    if (this.status === 'completed' && !this.completedDate) {
      this.completedDate = new Date();
    }
    
    next();
  } catch (error) {
    console.error('❌ Error in payment pre-save middleware:', error);
    next(error);
  }
});

// Indexes
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ invoiceVerificationId: 1 });
paymentSchema.index({ invoiceNo: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ 'vendor.id': 1 });
paymentSchema.index({ processedBy: 1 });

export default mongoose.model('Payment', paymentSchema);
