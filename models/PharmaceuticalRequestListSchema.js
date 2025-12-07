import mongoose, { Schema } from 'mongoose';

const PharmaceuticalRequestListSchema = new Schema({
  uniqueHealthIdentificationId: {
    type: Schema.Types.ObjectId,
    ref: 'UHID',
    required: [true, 'UHID is required'],
  },

  inpatientCaseUniqueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InpatientCase'
  },
  
  outpatientCaseUniqueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OutpatientCase'
  },

  requestForType: {
    type: String,
    enum: ['sales', 'return'],
  },

  patientType: {
    type: String,
    enum: ['operationTheatre', 'inpatientDepartment', 'outpatientDepartment'],
    required: [true, 'Patient type is required']
  },

  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },

  billingType: {
    type: String,
    enum: ['card', 'cash', 'cheque'],
  },

  pharmacistUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },

  // ✅ Move createdBy to main document level (if needed)
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },

  packages: [{
    medicineName: {
      type: String
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
    },
    dosageInstruction: {
      type: String,
    },
    checkbox: {
      morning: { type: Boolean, default: false },
      noon: { type: Boolean, default: false },
      evening: { type: Boolean, default: false },
      night: { type: Boolean, default: false },
    },
    charge: {
      type: Number,
      required: [true, 'Charge is required'],
    },
    // ✅ Remove createdBy from here if you moved it above
    // Or keep it here if each package has its own creator
  }],
}, {
  timestamps: true,
});

export default mongoose.model('PharmaceuticalRequestList', PharmaceuticalRequestListSchema);
