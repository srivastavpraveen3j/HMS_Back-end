// models/goodsReceiptNoteItem.model.js
import mongoose from 'mongoose';

const goodsReceiptNoteItemSchema = new mongoose.Schema({
  goodsReceiptNote: { type: mongoose.Schema.Types.ObjectId, ref: 'GoodsReceiptNote', required: true },
  itemName: String,
  quantityReceived: Number,
  expiryDate: Date,
  damaged: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('GoodsReceiptNoteItem', goodsReceiptNoteItemSchema);
