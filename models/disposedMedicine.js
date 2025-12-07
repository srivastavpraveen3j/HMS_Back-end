// models/disposedMedicine.js
import mongoose from 'mongoose';

const disposedMedicineSchema = new mongoose.Schema({
  medicine_name: {
    type: String,
    required: [true, 'Medicine name is required']
  },
  supplier: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Vendor',
      required: [true, 'Supplier is required'] 
    },
  dose: {
    type: Number,
    required: [true, 'Dose is required'],
    min: [0, 'Dose must be a positive number']
  },
  expiry_date: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  mfg_date: {
    type: Date,
    required: [true, 'Manufacturing date is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
  },
  disposed_stock: {
    type: Number,
    required: [true, 'Disposed stock is required'],
    min: [0, 'Disposed stock must be a positive number']
  },
  batch_no: {
    type: String,
    required: [true, 'Batch number is required']
  },
  disposal_date: {
    type: Date,
    default: Date.now
  },
  disposal_reason: {
    type: String,
    enum: ['expired', 'damaged', 'recalled', 'other'],
    default: 'expired'
  },
  disposed_by: {
    type: String,
    required: [true, 'Disposed by is required']
  },
  original_medicine_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: [true, 'Original medicine ID is required']
  },
    replacement_requested: {
    type: Boolean,
    default: false
  },
  replacement_po_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    required: false
  },
  replacement_status: {
    type: String,
    enum: ['pending', 'po_generated', 'po_sent', 'replaced', 'cancelled'],
    default: 'pending'
  },
  auto_replacement_eligible: {
    type: Boolean,
    default: function() {
      return this.disposal_reason === 'expired';
    }
  }
}, { timestamps: true });

const DisposedMedicine = mongoose.model('DisposedMedicine', disposedMedicineSchema);
export default DisposedMedicine;
