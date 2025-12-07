// models/vendor.model.js
import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    vendorName: { type: String, required: true },
    contactPerson: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    gstNumber: { type: String },
    isFavourite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// export default mongoose.model('Vendor', vendorSchema);
const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
