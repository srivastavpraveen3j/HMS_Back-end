import mongoose from "mongoose";

const BedTypeSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'] },           // e.g., ICU-BED, COT, ELECTRIC-BED
  description: { type: String, default: "" },
  is_active: { type: Boolean, default: true },
  price_per_day: { type: Number, required: [true, 'Price is required'] }  // price in your preferred currency unit (e.g., INR, USD)
}, { timestamps: true });

const BedType = mongoose.model("BedType", BedTypeSchema);
export default BedType;