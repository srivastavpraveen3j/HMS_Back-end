// models/purchaseOrderItem.model.js
import mongoose from 'mongoose';

const purchaseOrderItemSchema = new mongoose.Schema({
  purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
  itemName: String,
  quantity: Number,
  rate: Number,
  total: Number
}, { timestamps: true });

export default mongoose.model('PurchaseOrderItem', purchaseOrderItemSchema);
