// models/purchaseIndentItem.model.js
import mongoose from 'mongoose';

const purchaseIndentItemSchema = new mongoose.Schema({
  purchaseIndent: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseIndent', required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String }
}, { timestamps: true });

export default mongoose.model('PurchaseIndentItem', purchaseIndentItemSchema);