// models/Room.js
import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: [true, 'Room number is required'] }, // e.g., A101
    bed_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bed", required: [true, 'Bed id is required'] }],
    room_type_id: { type: mongoose.Schema.Types.ObjectId, ref: "RoomType", required: [true, 'Room type id is required'] },
    isActive: { type: Boolean, default: true },
    remarks: { type: String },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", RoomSchema);
export default Room;

