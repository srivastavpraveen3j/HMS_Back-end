// models/requestForQuotationItem.model.js
import mongoose from 'mongoose';

const requestForQuotationItemSchema = new mongoose.Schema({
  requestForQuotation: { type: mongoose.Schema.Types.ObjectId, ref: 'RequestForQuotation', required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number },
  unit: { type: String },
  vendorQuotations: [{
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    price: { type: Number },
    deliveryTimeInDays: { type: Number }
  }]
}, { timestamps: true });

export default mongoose.model('RequestForQuotationItem', requestForQuotationItemSchema);
