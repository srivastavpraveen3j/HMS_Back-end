import mongoose from 'mongoose';

const outpatientDepositSchema = new mongoose.Schema(
  {
    outpatientBillId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to Outpatient Bill
      ref: "OutpatientBill",
      required: [true, "Outpatient bill ID is required"],
    },
    depositAmount: {
      type: Number,
      required: [true, "Deposit amount is required"],
      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: "Deposit amount cannot be negative",
      },
    },
    depositorName: {
      type: String, // Name of the person making the deposit
      required: [true, "Depositor name is required"],
    },
    depositPaymentMethod: {
      type: String, // Payment method (e.g., cash, card, etc.)
      enum: ["cash", "card", "bank_transfer", "cheque", "upi"],
      required: [true, "Deposit payment method is required"],
    },
    transactionId: { type: String },
  },
  {
    timestamps: true,
  }
);


const OutpatientDeposit = mongoose.model('OutpatientDeposit', outpatientDepositSchema);

export default OutpatientDeposit;

