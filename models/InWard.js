import mongoose from "mongoose";

const TestParameterSchema = new mongoose.Schema({
  test_name: {
    type: String,
    required: [true, "Test name is required"],
  },
  units: {
    type: String,
  },
  shortname: {
    type: String,
  },
  default: {
    type: String,
  },
  min: {
    type: String,
  },
  max: {
    type: String,
  },
  input: { type: String },
});

const inWardSchema = new mongoose.Schema(
  {
    uniqueHealthIdentificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UHID",
      required: function () {
        return !this.isWalkIn;
      },
    },

    requestedDepartment: {
      type: String,
      enum: ["pathology", "radiology", "radiation"],
      // required: [true, "Requested department is required"],
    
    },

    requestedDepartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DepartmentRequestList",
      required: function () {
        return !this.isWalkIn;
      },
    },

    inWardNumber: { type: Number },
    collectionDate: { type: Date },
    collectionTime: { type: String },

    reportDate: { type: Date },
    reportTime: { type: String },

    testMaster: [
      {
        testGroup: {
          type: String,
          required: [true, "Test group is required"],
        },
        testParameters: [TestParameterSchema],
        description: {
          type: String,
          trim: true,
        },
        price: {
          type: Number,
          required: [true, "Price is required"],
        },
        status: { type: String, enum: ["completed", "pending"] },
      },
    ],
    remarks: { type: String },
    type: {
      type: String,
      enum: ["inpatientDepartment", "outpatientDepartment"],
      required: [true, "Type is required"],
    },

    initials: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dueAmount: {
      type: Number,
      // required: [true, "Due amount is required"],
    },
    PaymentMode: {
      type: String,
      enum: ["cash", "card", "upi", "insurance", "other"],
      required: [true, "Payment mode is required"],
    },
    transactionId: { type: String },
    amountReceived: {
      type: Number,
      // required: [true, "Amount received is required"],
    },
    total: {
      type: Number,
      required: [true, "Total is required"],
    },

    isWalkIn: {
      type: Boolean,
      default: false,
    },
    walkInPatient: {
      name: { type: String },
      age: { type: Number },
      gender: { type: String, enum: ["Male", "Female", "Other"] },
      mobile_no: { type: String },
      referenceDoctor :  { type: String },
      address : {type: String}

    },
  },
  {
    timestamps: true,
  }
);

const InWard = mongoose.model("InWard", inWardSchema);
export default InWard;
