// models/purchaseRequisitionItem.model.js
import mongoose from "mongoose";

const purchaseRequisitionItemSchema = new mongoose.Schema(
  {
    purchaseRequisition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseRequisition",
      required: true,
    },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String },
    remarks: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model(
  "PurchaseRequisitionItem",
  purchaseRequisitionItemSchema
);
