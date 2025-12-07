// models/requestForQuotation.model.js
import mongoose from "mongoose";

const RFQItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  quantityRequired: { type: Number, required: true },
  departmentName: { type: String, required: true },
  status: { type: String },
  remarks: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  materialRequestNumber: { type: String },
  
  // Vendor quotation details - populated when quotations are received
  vendorQuotations: [{
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    vendorName: { type: String },
    brand: { type: String },
    strength: { type: String },
    description: { type: String },
    unitPrice: { type: Number },
    discount: { type: Number, default: 0 }, // Percentage
    netPrice: { type: Number }, // After discount
    totalPrice: { type: Number }, // netPrice * quantity
    quotedAt: { type: Date, default: Date.now },
    isSelected: { type: Boolean, default: false }
  }],
  
  // Final selected vendor details
  selectedVendor: {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    vendorName: { type: String },
    brand: { type: String },
    strength: { type: String },
    unitPrice: { type: Number },
    discount: { type: Number },
    netPrice: { type: Number },
    totalPrice: { type: Number },
    selectedAt: { type: Date }
  }
});

const requestForQuotationSchema = new mongoose.Schema(
  {
    sentToVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }],
    items: [RFQItemSchema],
    status: {
      type: String,
      enum: ["open", "closed", "quotagiven", "compared", "vendorselected", "pogenerated"],
      default: "open",
    },
    rfqNumber: {
      type: String,
      unique: true,
    },
    
    // Comparison and selection tracking
    comparisonData: {
      totalVendorsQuoted: { type: Number, default: 0 },
      comparedAt: { type: Date },
      finalVendorSelected: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
      finalVendorName: { type: String },
      totalAmount: { type: Number },
      totalSavings: { type: Number },
      selectedAt: { type: Date }
    }
  },
  { timestamps: true }
);

export default mongoose.model("RequestForQuotation", requestForQuotationSchema);
