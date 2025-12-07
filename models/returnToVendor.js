// models/returnToVendor.model.js
import mongoose from 'mongoose';

const returnToVendorSchema = new mongoose.Schema({
  goodsReceiptNoteItem: { type: mongoose.Schema.Types.ObjectId, ref: 'GoodsReceiptNoteItem', required: true },
  reason: { type: String, enum: ['expired', 'damaged', 'excess'] },
  quantity: Number,
  returnDate: Date,
  createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('ReturnToVendor', returnToVendorSchema);
