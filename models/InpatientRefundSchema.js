const InpatientRefundSchema = new Schema({
    inpatientDepositId: {
      type: Schema.Types.ObjectId,
      ref: "InpatientDeposit",
      required: [true, "Inpatient deposit ID is required"],
    },
    billedAmount: {
      type: Number,
      required: [true, "Billed amount is required"],
      validate: {
        validator: (value) => value >= 0,
        message: "Billed amount cannot be negative",
      },
    },
    amountRefunded: {
      type: Number,
      required: [true, "Refund amount is required"],
      validate: {
        validator: (value) => value >= 0,
        message: "Refund amount cannot be negative",
      },
    },
    receiverFullName: {
      type: String,
      required: [true, "Receiver full name is required"],
    },
    isOnlinePaymentMode: {
      type: Boolean,
      required: [true, "Is online payment mode is required"],
    },
  });
