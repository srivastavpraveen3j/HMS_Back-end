import mongoose from "mongoose";

const BedSchema = new mongoose.Schema({
  bed_number: { type: String, required: [true, 'Bed number is required'] },
  bed_type_id: { type: mongoose.Schema.Types.ObjectId, ref: "BedType", required: [true, 'Bed type is required'] },
  is_occupied: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  remarks: { type: String, default: "" },
}, { timestamps: true });

const Bed = mongoose.model("Bed", BedSchema);
export default Bed;