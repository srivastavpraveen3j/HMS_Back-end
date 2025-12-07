import mongoose from "mongoose";
const { Schema, Types } = mongoose;

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
      required: [true, "Unique Health Identification ID is required"],
    },

    requestedDepartment: {
      type: String,
      enum: ["pathology", "radiology", "radiation"],
      required: [true, "Requested department is required"],
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
      required: [true, "Amount received is required"],
    },
    total: {
      type: Number,
      required: [true, "Total is required"],
    },
  },
  {
    timestamps: true,
  }
);

const ServiceSchema = new Schema(
  {
    _id: { type: Types.ObjectId, required: [true, "ID is required"] },
    name: { type: String, required: [true, "Name is required"], trim: true },
    charge: { type: Number, required: [true, "Charge is required"], min: 0 },
    type: {
      type: String,
      // required: [true, "Type is required"],
      enum: ["ipd", "opd", "radiology"],
    },
  },
  { _id: false }
);

const InpatientBillSchema = new Schema(
  {
    uhid: { type: Types.ObjectId },
    uniqueHealthIdentificationId: {
      type: Types.ObjectId,
      required: [true, "UHID is required"],
    },
    admissionDate: {
      type: Date,
      required: [true, "Admission date is required"],
    },
    serviceId: [
      {
        name: {
          type: String,
          required: [true, "Service name is required"],
          trim: true,
        },
        charge: {
          type: Number,
          required: [true, "Service charge is required"],
          min: [1, "Service charge must be greater than 0"],
        },
        type: {
          type: String,
          enum: ["ipd", "opd", "radiology"],
          required: [true, "Service type is required"],
        },
      },
    ],
    totalServiceChargeAmount: {
      type: Number,
      required: [true, "Total service charge amount is required"],
      min: 0,
    },
    previousBill: [{ type: Schema.Types.Mixed, default: {} }],
    totalBillAmount: {
      type: Number,
      required: [true, "Total bill amount is required"],
      min: 0,
    },
    totalDepositAmount: {
      type: Number,
      required: [true, "Total deposit amount is required"],
      min: 0,
    },
    service: { type: [ServiceSchema], required: [true, "service is required"] },
  },
  { _id: false }
);

const RoomTypeSchema = new Schema(
  {
    _id: { type: Types.ObjectId, required: [true, "ID is required"] },
    name: { type: String, required: [true, "name is required"] },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    pricePerDay: {
      type: Number,
      required: [true, "Price per day is required"],
      min: 0,
    },
  },
  { _id: false }
);

const BedTypeSchema = new Schema(
  {
    _id: { type: Types.ObjectId, required: [true, "iD is required"] },
    name: { type: String, required: [true, "Name is required"] },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    pricePerDay: {
      type: Number,
      required: [true, "Price per day is required"],
      min: 0,
    },
  },
  
  { _id: false }
);


const BedSchema = new Schema(
  {
    _id: { type: Types.ObjectId, required: [true, "ID is required"] },
    bedNumber: { type: String, required: [true, "Bed number is required"] },
    bedTypeId: {
      type: Types.ObjectId,
      required: [true, "Bed type ID is required"],
    },
    isOccupied: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    remarks: { type: String },
    bedType: { type: BedTypeSchema, required: [true, "Bed type is required"] },
  },
  { _id: false }
);

const RoomSchema = new Schema(
  {
    _id: { type: Types.ObjectId, required: [true, "ID is required"] },
    roomNumber: { type: String, required: [true, "Room number is required"] },
    bedId: [{ type: Types.ObjectId, required: [true, "Bed ID is required"] }],
    roomTypeId: {
      type: Types.ObjectId,
      required: [true, "Room type ID is required"],
    },
    isActive: { type: Boolean, default: true },
    remarks: { type: String },
    roomType: {
      type: RoomTypeSchema,
      required: [true, "Room type is required"],
    },
  },
  { _id: false }
);

const DoctorSchema = new Schema(
  {
    _id: { type: Types.ObjectId, required: [true, "ID is required"] },
    name: { type: String, required: [true, "Name is required"], trim: true },
    refCode: { type: String },
    mobile_no: { type: String },
    address: { type: String },
    dob: { type: Date },
    sign: { type: String },
    dr_type: {
      type: String,
      enum: ["superSpecialist", "doctor"],
      // required: [true, "Dr type is required"],
    },
    type: {
      type: String,
      enum: ["consulting", "referring", "both"],
      // required: [true, "Type is required"],
    },
    reg_no: {
      type: String,
      // required: [true, "Registration number is required"],
    },
    degree: { type: String },
    speciality: { type: String },
    specialization: { type: String },
    qualifications: { type: String },
    experience: { type: String },
    pan_no: { type: String },
    email: { type: String, required: [true, "Email is required"], trim: true },
    profilePicUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const InpatientCaseSchema = new Schema(
  {
    isDischarge: { type: Boolean, default: false },
    admissionDate: {
      type: Date,
      required: [true, "Admission date is required"],
    },
    admissionTime: {
      type: Date,
      required: [true, "Admission time is required"],
    },
    inpatientCaseNumber: { type: String },
    isMedicoLegalcase: { type: Boolean, default: false },
    patient_type: { type: String },
    companyName: { type: String },
    createdAt: { type: Date, default: Date.now },
    admittingDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: [true, "Admitting doctor is required"],
    },
    room: { type: RoomSchema, required: [true, "Room is required"] },
    bed: { type: BedSchema, required: [true, "Bed is required"] },
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { _id: false }
);

const CheckboxSchema = new Schema(
  {
    morning: { type: Boolean, default: false },
    noon: { type: Boolean, default: false },
    evening: { type: Boolean, default: false },
    night: { type: Boolean, default: false },
  },
  { _id: false }
);

const PharmaceuticalPackageSchema = new Schema(
  {
    _id: { type: Types.ObjectId, required: [true, "ID is required"] },
    medicineName: {
      type: String,
      required: [true, "Medicine name is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: 1,
    },
    dosageInstruction: { type: String },
    checkbox: { type: CheckboxSchema, default: {} },
    charge: { type: Number, required: [true, "Charge is required"], min: 0 },
  },
  { _id: false }
);

const PharmaceuticalInwardSchema = new Schema(
  {
    _id: { type: Types.ObjectId, required: [true, "ID is required"] },
    inwardSerialNumber: {
      type: String,
      required: [true, "Inward serial number is required"],
    },
    pharmaceuticalRequestId: {
      type: Types.ObjectId,
      required: [true, "Pharmaceutical request ID is required"],
    },
    dueAmount: {
      type: Number,
      required: [true, "Due amount is required"],
      min: 0,
    },
    paymentMode: {
      type: String,
      required: [true, "Payment mode is required"],
      enum: ["cash", "card", "upi", "insurance", "other"],
    },
    amountReceived: {
      type: Number,
      required: [true, "Amount received is required"],
      min: 0,
    },
    total: { type: Number, required: [true, "Total is required"], min: 0 },
    uniqueHealthIdentificationId: {
      type: Types.ObjectId,
      required: [true, "UHID is required"],
    },
    packages: {
      type: [PharmaceuticalPackageSchema],
      required: [true, "Packages is required"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: ["pending", "completed"],
    },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const IntermBillSchema = new Schema(
  {
    uhid: { type: String },
    patientName: { type: String, required: [true, "Patient name is required"] },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["male", "female", "other"],
    },
    dob: { type: Date, required: [true, "DOB is required"] },
    age: { type: String, required: [true, "Age is required"] },
    dor: { type: Date, required: [true, "Date of registration is required"] },
    dot: { type: Date, required: [true, "DOT is required"] },
    mobileNo: { type: String, required: [true, "Mobile number is required"] },
    area: { type: String },
    pincode: { type: String },
    inpatientCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InpatientCase",
    },
    inpatientCase: {
      type: [InpatientCaseSchema],
      required: [true, "inpatient case is required"],
    },
    inpatientBills: {
      type: [InpatientBillSchema],
      required: [true, "Inpatient bill is required"],
    },
    inpatientBillsTotal: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    consultingDoctor: {
      type: DoctorSchema,
      required: [true, "Consulting doctor is required"],
    },
    pharmaceuticalInward: {
      type: [PharmaceuticalInwardSchema],
      required: [true, "Pharmaceutical inward is required"],
    },
    pharmaceuticalInwardTotal: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    medicaltestinward: {
      type: [inWardSchema],
      required: [true, "Inward is required"],
    },
    medicaltestinwardTotal: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // New explicit billing summary fields
    totalRoomCharges: { type: Number, required: true, min: 0 },
    totalInpatientCharges: { type: Number, required: true, min: 0 },
    totalPharmacyCharges: { type: Number, required: true, min: 0 },
    totalMedicalCharges: { type: Number, required: true, min: 0 },
    totalOperationTheaterCharges: { type: Number, required: true, min: 0 },
    // patientType:{ type: String, required: true, enum: ['inpatient', 'outpatient'] },
    patientType: { type: String },
    grandTotalAmount: { type: Number, required: true, min: 0 },
    depositAmount: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },
    netPayableAmount: { type: Number, required: true, min: 0 },
    // paymentMode: {
    //   type: String,
    //   enum: ["cash", "card", "upi", "insurance", "other"],
    // },
    cashAmount: { type: Number, default: 0, min: 0 },
    cardAmount: { type: Number, default: 0, min: 0 },
    upiAmount: { type: Number, default: 0, min: 0 },
    amount_received: { type: Number },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const InpatientIntermBillHistory = mongoose.model(
  "InpatientIntermBillHistory",
  IntermBillSchema
);
export default InpatientIntermBillHistory;
