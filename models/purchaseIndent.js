// models/purchaseIndent.model.js
import mongoose from 'mongoose';

const purchaseIndentSchema = new mongoose.Schema({
  createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // sourcePurchaseRequisitions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseRequisition' }],
  
    sourcePurchaseRequisitions : [{
        departmentName: {
          type: String,
          required: true,
          trim: true,
        },
        itemName: {
          type: String,
          required: true,
          trim: true,
        },
        category: {
          type: String,
          required: true,
          trim: true,
        },
        quantityRequired: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        status: {
          type: String,
          enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
          default: 'Draft',
        },
        remarks: {
          type: String,
          trim: true,
        },
        // createdBy: {
        //   type: mongoose.Schema.Types.ObjectId,
        //   ref: 'User', // optional: track who submitted the request
        //   required: true,
        // },
        approvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // optional: track who submitted the request
          // required: true,
        },
          materialRequestNumber: {
          type: String,
          // unique: true
        },
    }],
  status: {
    type: String,
    enum: ['pending', 'processed'],
    default: 'pending'
  }
}, { timestamps: true });

export default mongoose.model('PurchaseIndent', purchaseIndentSchema);
