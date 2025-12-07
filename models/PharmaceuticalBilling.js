import mongoose, { Schema } from 'mongoose';

const PharmaceuticalBillingSchema = new Schema({
  uniqueHealthIdentificationId: {
    type: Schema.Types.ObjectId,
    ref: 'UniqueHealthIdentification', // Refers to UHID
    required: [true, 'UHID is required'],
  },
  pharmaceuticalInwardRecordId: {
    type: [Schema.Types.ObjectId],
    ref: 'PharmaceuticalInward', // Refers to Pharmaceutical Inward record
    required: [true, 'Pharmaceutical inward record ID is required'],
  },
  totalBillingAmount: {
    type: Number,
    required: [true, 'Total billing amount is required'],
  },
  amountReceivedFromPatient: {
    type: Number,
    required: [true, 'Amount received from patient is required'],
  }
}, {
  timestamps: true
});


const PharmaceuticalBilling = mongoose.model('PharmaceuticalBilling', PharmaceuticalBillingSchema);
export default PharmaceuticalBilling;