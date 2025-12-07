// models/distributionTransfer.js
import mongoose from 'mongoose';

const distributionTransferSchema = new mongoose.Schema({
  transferId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'TRF-' + Date.now().toString().slice(-6);
    }
  },
  
  from: {
    type: String,
    required: [true, 'Source pharmacy is required'],
    default: 'Central Store'
  },
  
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubPharmacy',
    required: [true, 'Destination sub-pharmacy is required']
  },
  
  items: [{
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    medicine_name: {
      type: String,
      required: true
    },
    requested_quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    approved_quantity: {
      type: Number,
      default: 0,
      min: 0
    },
    batch_details: [{
      batch_no: String,
      expiry_date: Date,
      mfg_date: Date,
      unit_price: Number,
      quantity: Number
    }],
    unit_price: {
      type: Number,
      required: true,
      min: 0
    },
    total_value: {
      type: Number,
      default: 0
    }
  }],
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'in_progress', 'completed', 'rejected'],
    default: 'pending'
  },
  
  total_items_count: {
    type: Number,
    default: 0
  },
  
  total_value: {
    type: Number,
    default: 0
  },
  
  requested_by: {
    type: String,
    required: true
  },
  
  approved_by: {
    type: String
  },
  
  approved_at: Date,
  completed_at: Date,
  
  remarks: String,
  
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  }
  
}, { timestamps: true });

// Calculate totals before saving
// models/distributionTransfer.js - Update the pre-save hook
// distributionTransferSchema.pre('save', function(next) {
//   this.total_items_count = this.items.length;
  
//   // Calculate total value based on status
//   this.total_value = this.items.reduce((total, item) => {
//     let quantity;
    
//     // Use appropriate quantity based on transfer status
//     if (this.status === 'pending') {
//       quantity = item.requested_quantity || 0;
//     } else if (this.status === 'approved' || this.status === 'in_progress' || this.status === 'completed') {
//       quantity = item.approved_quantity || item.requested_quantity || 0;
//     } else {
//       quantity = item.requested_quantity || 0;
//     }
    
//     // Calculate item total
//     item.total_value = quantity * (item.unit_price || 0);
//     return total + item.total_value;
//   }, 0);
  
//   next();
// });

// models/distributionTransfer.js
distributionTransferSchema.pre('save', function(next) {
  // ✅ SKIP pre-save calculations for bulk transfers since we handle it manually
  if (this.requested_by === 'BulkUploader' || this.skipPreSave) {
    console.log('⚠️ Skipping pre-save hook for bulk transfer');
    return next();
  }
  
  console.log('🔄 Running pre-save hook for regular transfer');
  
  this.total_items_count = this.items.length;
  
  // Calculate total value based on status
  this.total_value = this.items.reduce((total, item) => {
    let quantity;
    
    if (this.status === 'pending') {
      quantity = item.requested_quantity || 0;
    } else if (this.status === 'approved' || this.status === 'in_progress' || this.status === 'completed') {
      quantity = item.approved_quantity || item.requested_quantity || 0;
    } else {
      quantity = item.requested_quantity || 0;
    }
    
    item.total_value = quantity * (item.unit_price || 0);
    return total + item.total_value;
  }, 0);
  
  next();
});


const DistributionTransfer = mongoose.model('DistributionTransfer', distributionTransferSchema);
export default DistributionTransfer;
