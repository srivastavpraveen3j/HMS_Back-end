// models/vendorQuotation.model.js
import mongoose from "mongoose";

const vendorQuotationSchema = new mongoose.Schema({
  rfq: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RequestForQuotation",
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
      itemName: { type: String, required: true },
      brand: { type: String },
      strength: { type: String },
      description: { type: String },
      quantityRequired: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      netPrice: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true }, // Vendor's final amount
  gstIncluded: { type: Boolean, default: false },
  gstPercentage: { type: Number, default: 0, min: 0, max: 50 },
  gstAmount: { type: Number, default: 0 }, // Calculated for display
  finalAmount: { type: Number, required: false }, // Same as totalAmount
  submittedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['submitted', 'reviewed', 'accepted', 'rejected'], 
    default: 'submitted' 
  },
});

// *** REMOVE ALL PRE-SAVE MIDDLEWARE ***
// No automatic calculations - use vendor's provided values

const VendorQuotation = mongoose.model("VendorQuotation", vendorQuotationSchema);
export default VendorQuotation;
