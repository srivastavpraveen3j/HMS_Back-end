import mongoose from "mongoose";
const { Schema } = mongoose;

const DepositSchema = new Schema({
  depositDate: { type: Date, required: [true, 'Deposit date is required'] },
  amount: { type: Number, required: [true, 'Amount is required'] },
  paymentMode: { type: String, enum: ["cash", "card", "insurance", "upi", "other"], required: [true, 'Payment mode is required'] },
  remarks: { type: String }
}, { _id: false });

const AllocationSchema = new Schema({
  type: { type: String, enum: ["bed", "room"], required: [true, 'Type is required'] },
  name: { type: String, required: [true, 'Name is required'] },
  pricePerDay: { type: Number, required: [true, 'Price per day is required'] },
  from: { type: Date, required: [true, 'From is required'] },
  to: { type: Date },
  totalDays: { type: Number, required: [true, 'Total days is required'] },
  totalCharge: { type: Number, required: [true, 'Total charge is required'] }
}, { _id: false });

const ServiceChargeSchema = new Schema({
  name: { type: String, required: [true, 'Name is required'] },
  chargePerUnit: { type: Number, required: [true, 'Charge per unit is required'] },
  quantity: { type: Number, required: [true, 'Quantity is required'] },
  totalCharge: { type: Number, required: [true, 'Total charge is required'] }
}, { _id: false });

const PharmacyChargeSchema = new Schema({
  name: { type: String, required: [true, 'Name is required'] },
  pricePerUnit: { type: Number, required: [true, 'Price per unit is required'] },
  quantity: { type: Number, required: [true, 'Quantity is required'] },
  totalCharge: { type: Number, required: [true, 'Total charge is required'] }
}, { _id: false });

const OTChargeSchema = new Schema({
  procedureName: { type: String, required: [true, 'Procedure name is required'] },
  date: { type: Date, required: [true, 'Date is required'] },
  chargePerHour: { type: Number, required: [true, 'Charge per hour is required'] },
  durationHours: { type: Number, required: [true, 'Duration hours is required'] },
  totalCharge: { type: Number, required: [true, 'Total charge is required'] }
}, { _id: false });

const FinalBillSchema = new Schema({
  uhid: { type: String, required: [true, "UHID is required"] },
  admissionDate: { type: Date, required: [true, "Admission date is required"] },
  dischargeDate: { type: Date },

  allocations: [AllocationSchema],
  services: [ServiceChargeSchema],
  pharmacyCharges: [PharmacyChargeSchema],
  otCharges: [OTChargeSchema],

  totalRoomBedCharges: { type: Number, default: 0 },
  totalServiceCharges: { type: Number, default: 0 },
  totalPharmacyCharges: { type: Number, default: 0 },
  totalOTCharges: { type: Number, default: 0 },

  deposits: [DepositSchema], // <-- Added deposits array
  totalDepositAmount: { type: Number, default: 0 }, // <-- Sum of deposits

  grandTotal: { type: Number, default: 0 },

  amountReceived: { type: Number, default: 0 },
  amountDue: { type: Number, default: 0 },

  paymentMode: {
    type: String,
    enum: ["cash", "card", "insurance", "upi", "other"],
    default: "cash",
  },
  transactionId: { type: String },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },

  createdAt: { type: Date, default: Date.now },
});

const FinalBill = mongoose.model("FinalBill", FinalBillSchema);

export default FinalBill
