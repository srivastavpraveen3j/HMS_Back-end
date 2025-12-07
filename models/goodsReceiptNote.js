import mongoose from 'mongoose';

// Defect Detail Schema for tracking quality issues
const defectDetailSchema = new mongoose.Schema({
  serialNumber: { 
    type: String, 
    required: true 
  },
  defectReason: { 
    type: String, 
    required: true 
  },
  defectType: { 
    type: String, 
    enum: ['damaged', 'wrong_specification', 'expired', 'incomplete', 'quality_issue', 'packaging_issue', 'other'],
    required: true 
  },
  defectSeverity: {
    type: String,
    enum: ['minor', 'major', 'critical'],
    default: 'major'
  },
  defectImages: [String], // URLs for defect photos
  reportedBy: { 
    type: String, 
    required: true 
  },
  reportedAt: { 
    type: Date, 
    default: Date.now 
  },
  actionRequired: {
    type: String,
    enum: ['return_to_vendor', 'repair', 'dispose', 'accept_with_discount'],
    default: 'return_to_vendor'
  }
}, { _id: true });

// Enhanced GRN Item Schema with Quality Control
const grnItemSchema = new mongoose.Schema({
  itemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Item", 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String 
  },
  
  // Quantity Management
  quantityOrdered: { 
    type: Number, 
    required: true,
    min: [0, 'Ordered quantity must be positive']
  },
  quantityReceived: { 
    type: Number, 
    required: true,
    min: [0, 'Received quantity must be positive']
  },
  quantityPassed: { 
    type: Number, 
    default: 0,
    min: [0, 'Passed quantity must be positive']
  },
  quantityRejected: { 
    type: Number, 
    default: 0,
    min: [0, 'Rejected quantity must be positive']
  },
  quantityReturned: { 
    type: Number, 
    default: 0,
    min: [0, 'Returned quantity must be positive']
  },
  
  // Quality Control Fields
  qcStatus: {
    type: String,
    enum: ['pending', 'passed', 'partial_reject', 'full_reject', 'under_review'],
    default: 'pending'
  },
  qcPerformedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  qcPerformedAt: {
    type: Date
  },
  defectDetails: [defectDetailSchema],
  
  // Product Details
  batchNo: { 
    type: String 
  },
  expiryDate: { 
    type: Date 
  },
  mfgDate: {
    type: Date
  },
  remarks: { 
    type: String 
  },
  
  // Pricing
  unitPrice: { 
    type: Number, 
    required: true,
    min: [0, 'Unit price must be positive']
  },
  totalPrice: { 
    type: Number, 
    required: true,
    min: [0, 'Total price must be positive']
  },
  
  // Inventory Management
  addedToInventory: { 
    type: Boolean, 
    default: false 
  },
  inventoryUpdateDate: { 
    type: Date 
  },
  inventoryLocation: {
    type: String
  },
  
  // Return Management
  returnedToPO: { 
    type: Boolean, 
    default: false 
  },
  returnPONumber: { 
    type: String 
  },
  returnReason: {
    type: String
  },
  returnInitiatedAt: {
    type: Date
  }
}, { _id: true });

// Main GRN Schema
const goodsReceiptNoteSchema = new mongoose.Schema({
  // Vendor Information
  vendor: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true
    },
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String 
    },
    phone: { 
      type: String 
    },
    address: {
      type: String
    }
  },
  
  // RFQ Reference
  rfq: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RequestForQuotation",
      required: true
    },
    number: { 
      type: String, 
      required: true 
    }
  },
  
  // Items Array
  items: [grnItemSchema],
  
  // Overall GRN Status
  grnStatus: {
    type: String,
    enum: ['received', 'under_inspection', 'approved', 'partial_approved', 'rejected', 'cancelled'],
    default: 'received'
  },
  
  // Quality Control Summary
  qcSummary: {
    totalItems: { 
      type: Number, 
      default: 0 
    },
    inspectedItems: { 
      type: Number, 
      default: 0 
    },
    passedItems: { 
      type: Number, 
      default: 0 
    },
    rejectedItems: { 
      type: Number, 
      default: 0 
    },
    defectiveItems: { 
      type: Number, 
      default: 0 
    },
    qcStartedAt: { 
      type: Date 
    },
    qcCompletedAt: { 
      type: Date 
    },
    qcPerformedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    qcNotes: {
      type: String
    }
  },
  
  // Financial Information
  total: { 
    type: Number, 
    required: true,
    min: [0, 'Total must be positive']
  },
  approvedTotal: {
    type: Number,
    default: 0
  },
  rejectedTotal: {
    type: Number,
    default: 0
  },
  
  // Reference Numbers
  poNumber: { 
    type: String, 
    required: true 
  },
  grnNumber: { 
    type: String, 
    unique: true 
  },
  invoiceNumber: {
    type: String
  },
  deliveryNoteNumber: {
    type: String
  },
  
  // User Management
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  // Delivery Information
  deliveryDate: {
    type: Date,
    default: Date.now
  },
  expectedDeliveryDate: {
    type: Date
  },
  deliveryLocation: {
    type: String
  },
  transportDetails: {
    vehicleNumber: String,
    driverName: String,
    driverPhone: String
  },
  
  // Return Management
returnedToPO: { 
    type: Boolean, 
    default: false 
  },
  returnPONumber: { 
    type: String 
  },
  returnPOGenerated: {
    type: Boolean,
    default: false
  },
  returnReason: {
    type: String
  },
  returnInitiatedAt: {
    type: Date
  },
  returnStatus: {
    type: String,
    enum: ['not_applicable', 'pending', 'po_generated', 'vendor_acknowledged', 'items_collected', 'resolved', 'return_po_generated'],
    default: 'not_applicable'
  }, // Array for multiple return POs
  
  // Approval Workflow
  approvalRequired: {
    type: Boolean,
    default: true
  },
  approvalDate: {
    type: Date
  },
  approvalNotes: {
    type: String
  }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for completion percentage
goodsReceiptNoteSchema.virtual('qcCompletionPercentage').get(function() {
  if (this.qcSummary.totalItems === 0) return 0;
  return Math.round((this.qcSummary.inspectedItems / this.qcSummary.totalItems) * 100);
});

// Virtual for rejection rate
goodsReceiptNoteSchema.virtual('rejectionRate').get(function() {
  if (this.qcSummary.totalItems === 0) return 0;
  return Math.round((this.qcSummary.rejectedItems / this.qcSummary.totalItems) * 100);
});

// Pre-save middleware for validation
grnItemSchema.pre('save', function(next) {
  // Validate quantities
  if (this.quantityPassed + this.quantityRejected > this.quantityReceived) {
    return next(new Error(`Item ${this.name}: Passed + Rejected quantity cannot exceed received quantity`));
  }
  
  // Auto-calculate total price
  this.totalPrice = this.quantityPassed * this.unitPrice;
  
  next();
});

// Pre-save middleware for GRN
// In your GRN model, update the pre-save middleware
// In your GRN model pre-save middleware
// In your GRN model pre-save middleware
// CORRECTED Pre-save middleware for GRN
goodsReceiptNoteSchema.pre('save', function(next) {
  // Auto-calculate QC summary
  this.qcSummary.totalItems = this.items.length;
  this.qcSummary.inspectedItems = this.items.filter(item => 
    item.qcStatus !== 'pending'
  ).length;
  this.qcSummary.passedItems = this.items.filter(item => 
    item.qcStatus === 'passed'
  ).length;
  this.qcSummary.rejectedItems = this.items.filter(item => 
    item.qcStatus === 'full_reject' || item.qcStatus === 'partial_reject'
  ).length;
  
  // *** CORRECTED FINANCIAL CALCULATIONS ***
  // Calculate approved total based on PROPORTION of passed items
  this.approvedTotal = this.items.reduce((sum, item) => {
    if (item.quantityOrdered === 0) return sum;
    
    // Calculate proportional amount based on passed/ordered ratio
    const passedRatio = item.quantityPassed / item.quantityOrdered;
    const itemOriginalTotal = item.quantityOrdered * item.unitPrice;
    const itemApprovedAmount = itemOriginalTotal * passedRatio;
    
    return sum + itemApprovedAmount;
  }, 0);
  
  // Calculate rejected total based on PROPORTION of rejected items  
  this.rejectedTotal = this.items.reduce((sum, item) => {
    if (item.quantityOrdered === 0) return sum;
    
    // Calculate proportional amount based on rejected/ordered ratio
    const rejectedRatio = item.quantityRejected / item.quantityOrdered;
    const itemOriginalTotal = item.quantityOrdered * item.unitPrice;
    const itemRejectedAmount = itemOriginalTotal * rejectedRatio;
    
    return sum + itemRejectedAmount;
  }, 0);
  
  // *** ALTERNATIVE SIMPLE APPROACH ***
  // If all items are approved, approvedTotal should equal original total
  const allItemsPassed = this.items.every(item => 
    item.quantityPassed === item.quantityOrdered && item.quantityRejected === 0
  );
  
  if (allItemsPassed) {
    this.approvedTotal = this.total; // Use original PO total
    this.rejectedTotal = 0;
  }
  
  next();
});





// Indexes for better performance
goodsReceiptNoteSchema.index({ grnNumber: 1 });
goodsReceiptNoteSchema.index({ poNumber: 1 });
goodsReceiptNoteSchema.index({ grnStatus: 1 });
goodsReceiptNoteSchema.index({ createdAt: -1 });
goodsReceiptNoteSchema.index({ 'vendor.id': 1 });
goodsReceiptNoteSchema.index({ 'rfq.id': 1 });

export default mongoose.model('GoodsReceiptNote', goodsReceiptNoteSchema);
