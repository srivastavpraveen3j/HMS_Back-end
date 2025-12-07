// models/purchaseInvoice.model.js
import mongoose from 'mongoose';

const purchaseInvoiceSchema = new mongoose.Schema({
  goodsReceiptNote: { type: mongoose.Schema.Types.ObjectId, ref: 'GoodsReceiptNote', required: true },
  invoiceNumber: String,
  invoiceDate: Date,
  totalAmount: Number,
  status: {
    type: String,
    enum: ['pending', 'verified', 'paid'],
    default: 'pending'
  }
}, { timestamps: true });

export default mongoose.model('PurchaseInvoice', purchaseInvoiceSchema);
