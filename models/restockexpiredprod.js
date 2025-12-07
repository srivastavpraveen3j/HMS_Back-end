// models/restockexpiredprod.js - Add missing enum values
import mongoose from 'mongoose';

const transferRequestSchema = new mongoose.Schema({
  request_id: {
    type: String,
    required: true,
    unique: true
  },
  to_pharmacy: {
    pharmacy_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubPharmacy',
      required: true
    },
    pharmacy_name: String,
    pharmacy_type: String
  },
  requested_medicines: [{
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    medicine_name: String,
    requested_quantity: {
      type: Number,
      required: true,
      min: 1
    },
    approved_quantity: {
      type: Number,
      default: 0
    },
    unit_price: Number,
    total_cost: Number,
    urgency_level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    disposal_reference: String,
    availability_status: String,
    available_stock: Number,
    batch_no: String,
    expiry_date: Date
  }],
  request_type: {
    type: String,
    enum: ['restock', 'expired_replacement', 'urgent', 'maintenance'], 
    default: 'restock'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  requested_by: {
    user_id: String,
    user_name: String,
    role: String,
    department: String
  },
  notes: String,
  total_estimated_cost: {
    type: Number,
    default: 0
  },
  total_approved_cost: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'], // ✅ Added 'completed'
    default: 'pending'
  },
  approved_by: {
    user_id: String,
    user_name: String,
    role: String,
    approved_at: Date,
    approval_notes: String
  },
  rejection_reason: String,
 approval_history: [
  {
    action: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    by_name: String,
    by_email: String,   // ✅ Add this
    at: Date,
    notes: String
  }
]

}, { timestamps: true });

const TransferRequest = mongoose.model('TransferRequest', transferRequestSchema);
export default TransferRequest;
