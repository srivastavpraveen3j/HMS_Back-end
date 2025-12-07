import mongoose from 'mongoose';
 
// purchaseRequisition.js (model)
const purchaseRequisitionSchema = new mongoose.Schema({
  departmentName: { type: String, required: true, trim: true },
  itemName: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  quantityRequired: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
  status: { type: String, enum: ['Draft', 'Submitted', 'Approved', 'Rejected'], default: 'Draft' },
  remarks: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  materialRequestNumber: { type: String, unique: true },
  isIntended: { type: Boolean, default: false }, // Flag for auto-generated requests
  requestType: { type: String, enum: ['manual', 'auto-lowstock'], default: 'manual' }, // New field
  sourceItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }, // Reference to original inventory item
}, { timestamps: true });

 
export default mongoose.model('PurchaseRequisition', purchaseRequisitionSchema);
