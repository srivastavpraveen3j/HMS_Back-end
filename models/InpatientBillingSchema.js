// import mongoose from "mongoose";

// const ServiceSnapshotSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Service name is required"],
//       trim: true,
//     },
//     charge: {
//       type: Number,
//       required: [true, "Service charge is required"],
//       validate: {
//         validator: (val) => val > 0,
//         message: (props) => `${props.value} is not a valid service charge`,
//       },
//     },
//     type: {
//       type: String,
//       enum: ["ipd", "opd", "radiology"],
//       required: [true, "Service type is required"],
//     },
//     groupName: {
//       type: String,
//       required: [true, "Group name is required"],
//       trim: true,
//     },
//   },
//   { _id: false } // Prevent extra ObjectIds for each service
// );

// const InpatientBillingSchema = new mongoose.Schema({
//   uniqueHealthIdentificationId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "UHID",
//     required: [true, "Unique Health Identification ID is required"],
//   },
//   inpatientCaseId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "InpatientCase",
//   },
//   billNumber: {
//     type: String,
//     unique: true,
//   },
//   billingDate: {
//     type: Date,
//     required: [true, "Billing date is required"],
//     validate: {
//       validator: (val) => {
//         const now = new Date();
//         return val < now;
//       },
//       message: (props) => `${props.value} is not a valid billing date`,
//     },
//   },
//   billingTime: {
//     type: String,
//     required: [true, "Billing time is required"],
//     validate: {
//       validator: (val) => {
//         const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
//         return regex.test(val);
//       },
//       message: (props) => `${props.value} is not a valid billing time`,
//     },
//   },
//   patient_type: {
//     type: String,
//     enum: ["med", "cash", "cashless"],
//     required: [true, "Patient type is required"],
//   },
//   thirdPartyDetailId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "ThirdPartyAdministratorClaim",
//   },
//   admissionDate: {
//     type: Date,
//     required: [true, "Admission date is required"],
//   },
//   consultingDoctorId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: [true, "Consulting doctor ID is required"],
//   },
//   // serviceId: [
//   //   {
//   //     type: mongoose.Schema.Types.ObjectId,
//   //     ref: "Service",
//   //     required: [true, "Service ID is required"],
//   //   },
//   // ],
//   // 🔹 Embedded service snapshot
//   serviceId: {
//     type: [ServiceSnapshotSchema],
//     required: [true, "At least one service is required"],
//   },
//   totalServiceChargeAmount: {
//     type: Number,
//     required: [true, "Total service charge amount is required"],
//     validate: {
//       validator: (val) => val > 0,
//       message: (props) =>
//         `${props.value} is not a valid total service charge amount`,
//     },
//   },
//   previousBill: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "InpatientBilling",
//     },
//   ],
//   netPayableAmount: {
//     type: Number,
//     validate: {
//       validator: (val) => val > 0,
//       message: (props) => `${props.value} is not a valid net payable amount`,
//     },
//   },
//   totalBillAmount: {
//     type: Number,
//     required: [true, "Total bill amount is required"],
//     validate: {
//       validator: (val) => val > 0,
//       message: (props) => `${props.value} is not a valid total bill amount`,
//     },
//   },
//   totalDepositAmount: {
//     type: Number,
//     required: [true, "Total deposit amount is required"],
//     validate: {
//       validator: (val) => val > 0,
//       message: (props) => `${props.value} is not a valid total deposit amount`,
//     },
//   },
// });

// const InpatientBilling = mongoose.model(
//   "InpatientBilling",
//   InpatientBillingSchema
// );
// export default InpatientBilling;
import mongoose from "mongoose";

// ✅ UPDATED Service Snapshot Schema with Time-Based Billing
const ServiceSnapshotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
    },
    charge: {
      type: Number,
      required: [true, "Service charge is required"],
      validate: {
        validator: (val) => val > 0,
        message: (props) => `${props.value} is not a valid service charge`,
      },
    },
    type: {
      type: String,
      enum: ["ipd", "opd", "radiology"],
      required: [true, "Service type is required"],
    },
    groupName: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
    },
    
    // ✅ NEW FIELDS FOR TIME-BASED BILLING
    billingType: {
      type: String,
      enum: ['fixed', 'hourly', 'daily', 'session', 'quantity'],
      default: 'fixed',
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: [0.01, 'Quantity must be greater than 0'],
      required: [true, "Quantity is required"]
    },
    ratePerUnit: {
      type: Number,
      required: [true, "Rate per unit is required"],
      min: [0, 'Rate per unit cannot be negative']
    },
    unitLabel: {
      type: String,
      default: 'service',
      required: [true, "Unit label is required"]
      // Examples: 'hour', 'day', 'session', 'injection', 'unit', 'test'
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, 'Total amount cannot be negative']
      // This is calculated as: quantity × ratePerUnit
    }
  },
  { _id: false } // Prevent extra ObjectIds for each service
);

const InpatientBillingSchema = new mongoose.Schema({
  uniqueHealthIdentificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UHID",
    required: [true, "Unique Health Identification ID is required"],
  },
  inpatientCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InpatientCase",
  },
  billNumber: {
    type: String,
    unique: true,
  },
  billingDate: {
    type: Date,
    required: [true, "Billing date is required"],
    validate: {
      validator: (val) => {
        const now = new Date();
        return val <= now; // Changed to allow current date
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
  
  // ✅ Enhanced service snapshot with time-based billing
  serviceId: {
    type: [ServiceSnapshotSchema],
    required: [true, "At least one service is required"],
  },
  
  totalServiceChargeAmount: {
    type: Number,
    required: [true, "Total service charge amount is required"],
    validate: {
      validator: (val) => val >= 0, // Changed to allow 0
      message: (props) =>
        `${props.value} is not a valid total service charge amount`,
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
      validator: (val) => val >= 0,
      message: (props) => `${props.value} is not a valid net payable amount`,
    },
  },
  totalBillAmount: {
    type: Number,
    required: [true, "Total bill amount is required"],
    validate: {
      validator: (val) => val >= 0,
      message: (props) => `${props.value} is not a valid total bill amount`,
    },
  },
  totalDepositAmount: {
    type: Number,
    required: [true, "Total deposit amount is required"],
    validate: {
      validator: (val) => val >= 0,
      message: (props) => `${props.value} is not a valid total deposit amount`,
    },
  },
}, {
  timestamps: true
});

// ✅ Pre-save hook to auto-calculate totals
InpatientBillingSchema.pre('save', function(next) {
  // Calculate total from all services
  if (this.serviceId && this.serviceId.length > 0) {
    const total = this.serviceId.reduce((sum, service) => {
      return sum + (service.totalAmount || 0);
    }, 0);
    
    this.totalServiceChargeAmount = total;
    
    // Update totalBillAmount if not explicitly set
    if (!this.totalBillAmount || this.totalBillAmount === 0) {
      this.totalBillAmount = total;
    }
  }
  next();
});

const InpatientBilling = mongoose.model(
  "InpatientBilling",
  InpatientBillingSchema
);

export default InpatientBilling;
