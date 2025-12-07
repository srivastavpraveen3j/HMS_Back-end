import mongoose from 'mongoose';
import {generateCustomId} from '../utils/generateCustomId.js';
const InpatientBillingSchema = new mongoose.Schema({
  uniqueHealthIdentificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UHID",
    required: [true, "Unique Health Identification ID is required"],
  },
  billNumber: {
    type: String,
    default: () => generateCustomId("INPBILL"),
  },
  billingDate: {
    type: Date,
    required: [true, "Billing date is required"],
    validate: {
      validator: (val) => {
        const now = new Date();
        return val < now;
      },
      message: (props) => `${props.value} is not a valid billing date`,
    },
  },
  billingTime: {
    type: String,
    required: [true, "Billing time is required"],
    validate: {
      validator: (val) => {
        const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return regex.test(val);
      },
      message: (props) => `${props.value} is not a valid billing time`,
    },
  },
  patient_type: {
    type: String,
    enum: ["med", "cash", "cashless"],
    required: [true, "Patient type is required"],
  },
  thirdPartyDetailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ThirdPartyAdministratorClaim",
  },
  admissionDate: {
    type: Date,
    required: [true, "Admission date is required"],
  },
  consultingDoctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Consulting doctor ID is required"],
  },
  serviceId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service ID is required"],
    },
  ],
  totalServiceChargeAmount: {
    type: Number,
    required: [true, "Total service charge amount is required"],
    validate: {
      validator: (val) => val > 0,
      message: (props) => `${props.value} is not a valid total service charge amount`,
    },
  },
  previousBill: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InpatientBilling",
    },
  ],
  netPayableAmount: {
    type: Number,
    validate: {
      validator: (val) => val > 0,
      message: (props) => `${props.value} is not a valid net payable amount`,
    },
  },
  totalBillAmount: {
    type: Number,
    required: [true, "Total bill amount is required"],
    validate: {
      validator: (val) => val > 0,
      message: (props) => `${props.value} is not a valid total bill amount`,
    },
  },
  totalDepositAmount: {
    type: Number,
    required: [true, "Total deposit amount is required"],
    validate: {
      validator: (val) => val > 0,
      message: (props) => `${props.value} is not a valid total deposit amount`,
    },
  },
});

const PharmaceuticalInwardSchema = new mongoose.Schema({
  inwardSerialNumber: {
    type: String,
    required: [true, "Inward Serial Number is required"],
    default: () => generateCustomId("PH-I"),
  },
  pharmaceuticalRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PharmaceuticalRequestList",
    required: [true, "Pharmaceutical request ID is required"],
  },
  dueAmount: {
    type: Number,
  },
  PaymentMode: {
    type: String,
    enum: ["cash", "card", "upi", "insurance", "other"],
    required: [true, "Payment mode is required"],
  },
  transactionId: { type: String },
  amountReceived: {
    type: Number,
  },
  total: {
    type: Number,
    required: [true, "Total is required"],
  },
  uniqueHealthIdentificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UHID",
    required: [true, "UHID is required"],
  },
  packages: [
    {
      medicineName: {
        type: String,
        required: [true, "Medicine name is required"],
      },
      quantity: {
        type: Number,
        required: [true, "Quantity is required"],
      },
      dosageInstruction: {
        type: String,
        required: [true, "Dosage instruction is required"],
      },
      checkbox: {
        morning: { type: Boolean, default: false },
        noon: { type: Boolean, default: false },
        evening: { type: Boolean, default: false },
        night: { type: Boolean, default: false },
      },
      charge: {
        type: Number,
        required: [true, "Charge is required"],
      },
    },
  ],

  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  remarks: {
    type: String,
  },
  type: { type: String, enum: ["inpatientDepartment", "outpatientDepartment"] },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
});

const treatmentHistorySheetSchema = new mongoose.Schema({
  inpatientCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'InpatientCase' },
  uniqueHealthIdentificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'UHID' },
  medicalId: [PharmaceuticalInwardSchema],
  medicalTest: [InpatientBillingSchema],
  ThirdPartyAdministratorId: { type: mongoose.Schema.Types.ObjectId, ref: 'ThirdPartyAdministratorClaim' },
  date: { type: Date },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }
}, {
  timestamps: true
});

const TreatmentHistorySheet = mongoose.model('TreatmentHistorySheet', treatmentHistorySheetSchema);
export default TreatmentHistorySheet;
