// models/OutpatientBill.js
import mongoose from "mongoose";
import RadiologyRequest from './RadiologyRequest.js';

const OutpatientBillSchema = new mongoose.Schema(
  {
    OutpatientcaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OutpatientCase"
    },
    billnumber: {
      type: String,
    },
    patientUhid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UHID",
      required: [true, "Patient UHID is required"],
    },
    services: [
      {
        name: {
          type: String,
          required: [true, 'Name is required'],
          trim: true,
        },
        charge: {
          type: Number,
          required: [true, 'Charge is required'],
        },
        type: {
          type: String,
          enum: ['ipd', 'opd', 'radiology'], // Added radiology type
          required: [true, 'Type is required'],
        },
        isBilled: {
          type: Boolean,
          default: false,
        },
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Service'
        }
      }
    ],
    depositId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OutpatientDeposit",
        required: false,
      },
    ],
    totalamount: {
      type: Number,
      required: [true, "Total amount is required"],
    },
    netpay: {
      type: Number,
      required: [true, "Net pay is required"],
    },
    transactionId: { type: String },
    amountreceived: {
      type: Number,
      required: [true, "Amount received is required"],
      validate: {
        validator: function (v) {
          return v > 0 && v <= this.totalamount;
        },
        message:
          "Amount received must be more than 0 and not more than total amount",
      },
    },
    cash: {
      type: Number,
    },
    upi: {
      type: Number,
    },
    card: {
      type: Number
    },
    remarks: {
      type: String,
      default: "",
    },
    remainder: {
      type: Number,
      default: 0,
      min: [0, "Remainder cannot be negative"],
    },
    isDiscountRequested: {
      type: Boolean,
    },
    DiscountMeta: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscountMeta",
    },
    convertFromAppointment: { type: Boolean, default: false },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    Consulting_Doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
  },
  { timestamps: true }
);

// Post-save middleware to create radiology request
OutpatientBillSchema.post('save', async function (doc, next) {
  try {
    // Check if there are radiology services in this bill
    const radiologyServices = doc.services.filter(service =>
      service.type === 'radiology'
    );

    if (radiologyServices.length > 0) {
      // Get patient information
      await doc.populate([
        { path: 'patientUhid', select: 'patientName age gender' },
        { path: 'OutpatientcaseId', select: 'clinicalHistory' },
        { path: 'Consulting_Doctor', select: 'name' }
      ]);

      // Prepare radiology request data
      const radiologyRequestData = {
        patientUhid: doc.patientUhid._id,
        patientName: doc.patientUhid.patientName,
        age: doc.patientUhid.age,
        gender: doc.patientUhid.gender,
        sourceType: 'opd',
        opdBillId: doc._id,
        outpatientCaseId: doc.OutpatientcaseId,
        consultingDoctor: doc.Consulting_Doctor,
        clinicalHistory: doc.OutpatientcaseId?.clinicalHistory || 'Not provided',
        clinicalIndication: 'As per OPD consultation',
        requestTime: new Date().toLocaleTimeString(),
        requestedServices: radiologyServices.map(service => ({
          serviceId: service.serviceId,
          serviceName: service.name,
          charge: service.charge
        })),
        createdBy: doc.Consulting_Doctor
      };

      // Create radiology request
      const radiologyRequest = new RadiologyRequest(radiologyRequestData);
      await radiologyRequest.save();

      console.log(`Radiology request created: ${radiologyRequest.requestNumber}`);
    }

    next();
  } catch (error) {
    console.error('Error creating radiology request:', error);
    next(error);
  }
});

const outpatientBill = mongoose.model("OutpatientBill", OutpatientBillSchema);
export default outpatientBill;
