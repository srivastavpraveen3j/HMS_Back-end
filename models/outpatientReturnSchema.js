import mongoose from "mongoose";


const outpatientReturnSchema = new mongoose.Schema(
  {
    patientUhid: {
      type: mongoose.Schema.Types.ObjectId, // Reference to UHID
      ref: "UHID",
      required: [true, "Patient UHID is required"],
    },
    outpatientBillId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to Outpatient Bill
      ref: "OutpatientBill",
      required: [true, "Outpatient bill ID is required"],
    },
    outpatientDepositId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Outpatient Deposit
      ref: "OutpatientDeposit",
      required: [true, "Outpatient deposit ID is required"],
    },
    returnReceiverName: {
      type: String, // Name of the person receiving the return
      required: [true, "Return receiver name is required"],
    },
    returnPaymentMethod: {
      type: String, // Payment method for the return (e.g., cash, card, etc.)
      enum: ["cash", "card", "bank_transfer", "cheque", "upi"],
      required: [true, "Return payment method is required"],
    },
    transactionId: { type: String },
  },
  {
    timestamps: true,
  }
);
  
  const OutpatientReturn = mongoose.model('OutpatientReturn', outpatientReturnSchema);
  export default OutpatientReturn;