import mongoose from "mongoose";

const FinalBillDiscountSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ['room', 'service', 'pharmacy', 'ot'],
    required: [true, 'Item type is required']
  },
  itemName: { type: String, required: [true, 'Itam name is required'] },
  originalCharge: { type: Number, required: [true, 'Original charge is required'] },
  discountAmount: { type: Number, required: [true, 'Discount amount is required'] },
  finalCharge: { type: Number, required: [true, 'Final charge is required'] },
  remarks: { type: String }
}, { _id: false });


export default FinalBillDiscountSchema;
