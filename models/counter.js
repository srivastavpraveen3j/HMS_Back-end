import mongoose from "mongoose";
const counterSchema = new mongoose.Schema({
  module: {
    type: String,
    required: true
  },
   month: {  // ← ADD THIS FIELD
    type: String,
    required: false // Make it optional for backward compatibility
  },
  year: {
    type: String,
    required: true
  },
  lastBillNo:{
    type: String,
    default: "404"
  },
  value: {
    type: Number,
    default: 1,
    required: true
  }
}, { timestamps: true });


// Create compound index for better performance
counterSchema.index({ module: 1, year: 1, month: 1 }, { unique: true });

const Counter = mongoose.model('Counter', counterSchema);
export default Counter;