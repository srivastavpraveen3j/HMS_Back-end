// models/RoomType.js
import mongoose from "mongoose";

const RoomTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], unique: true }, // e.g., DELUX, GENERAL
    description: { type: String }, // optional
    isActive: { type: Boolean, default: true },
    price_per_day: { type: Number, required: [true, 'Price is required'] },
  },
  { timestamps: true }
);

const RoomType = mongoose.model("RoomType", RoomTypeSchema);
export default RoomType;