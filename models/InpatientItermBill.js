import mongoose, { Schema } from 'mongoose';
import {generateCustomId} from '../utils/generateCustomId.js';

const interimBillSchema = new Schema({
  interimBillId: {
    type: String,
    default: () => generateCustomId('IMB'), // e.g., INV-abc123def4567890
    required: [true, 'Interim bill ID is required'],
    unique: true,
    validate: {
      validator: (v) => /^[A-Z]+-[a-zA-Z0-9]{8}$/.test(v),
      message: (props) => `${props.value} is not a valid interim bill ID!`
    }
  },
  uniqueHospitalIdentificationId: {
    type: Schema.Types.ObjectId,
    ref: 'UniqueHospitalIdentification',
    required: [true, 'UHID is required'],
    validate: {
      validator: (v) => mongoose.Types.ObjectId.isValid(v),
      message: (props) => `${props.value} is not a valid UniqueHospitalIdentification ID!`
    }
  },
  inpatientCaseId: {
    type: Schema.Types.ObjectId,
    ref: 'InpatientCase',
    required: [true, 'Inpatient case ID is required'],
    validate: {
      validator: (v) => mongoose.Types.ObjectId.isValid(v),
      message: (props) => `${props.value} is not a valid InpatientCase ID!`
    }
  },
  inpatientBillingDetails: [{
    type: Schema.Types.ObjectId,
    ref: 'InpatientBilling',
    validate: {
      validator: (v) => mongoose.Types.ObjectId.isValid(v),
      message: (props) => `${props.value} is not a valid InpatientBilling ID!`
    }
  }],
  pharmacyInwardItems: [{
    type: Schema.Types.ObjectId,
    ref: 'PharmacyInward',
    validate: {
      validator: (v) => mongoose.Types.ObjectId.isValid(v),
      message: (props) => `${props.value} is not a valid PharmacyInward ID!`
    }
  }],
  operationTheatreBill: [{
    type: Schema.Types.ObjectId,
    ref: 'OperationTheatreSheet',
    validate: {
      validator: (v) => mongoose.Types.ObjectId.isValid(v),
      message: (props) => `${props.value} is not a valid OperationTheatreSheet ID!`
    }
  }],
  bedCharges: {
    type: String,
    validate: {
      validator: (v) => /^\d+(\.\d+)?$/.test(v),
      message: (props) => `${props.value} is not a valid bed charge amount!`
    }
  },
  roomCharges: {
    type: String,
    validate: {
      validator: (v) => /^\d+(\.\d+)?$/.test(v),
      message: (props) => `${props.value} is not a valid room charge amount!`
    }
  },
  depositAmounts: {
    type: Number,
    ref: 'InpatientDeposit',
    validate: {
      validator: (v) => /^[0-9]+(\.[0-9]{1,2})?$/.test(v),
      message: (props) => `${props.value} is not a valid deposit amount!`
    }
  },
  dueAmount: {
    type: Number,
    default: 0,
    validate: {
      validator: (v) => /^[0-9]+(\.[0-9]{1,2})?$/.test(v),
      message: (props) => `${props.value} is not a valid due amount!`
    }
  }
}, { timestamps: true });

export default mongoose.model('InterimBill', interimBillSchema);