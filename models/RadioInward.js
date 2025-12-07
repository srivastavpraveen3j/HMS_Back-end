// models/RadioInward.js
import mongoose from 'mongoose';

const SignatureSchema = new mongoose.Schema({
  signatureData: {
    type: String, // Base64 encoded signature
    required: [true, 'Signature data is required']
  },
  signatureType: {
    type: String,
    enum: ['draw', 'upload', 'text', 'select'],
    default: 'draw'
  },
  fileName: String, // For uploaded signatures
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const FindingTemplateSchema = new mongoose.Schema({
  templateName: {
    type: String,
    required: [true, 'Template name is required']
  },
  serviceName: {
    type: String,
    required: [true, 'Service name is required']
  },
  protocol: String,
  observation: String,
  impression: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const RadioInwardSchema = new mongoose.Schema({
  // Reference to original radiology request
  radiologyRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RadiologyRequest',
    required: [true, 'Radiology request ID is required']
  },
  
  // Patient information (from original request)
  patientUhid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UHID',
    required: [true, 'Patient UHID is required']
  },
  
  patientName: {
    type: String,
    required: [true, 'Patient name is required']
  },
  
  age: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Age is required']
  },
  
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  
  // Request details
  requestNumber: {
    type: String,
    required: [true, 'Request number is required']
  },
  
  sourceType: {
    type: String,
    enum: ['opd', 'ipd'],
    required: [true, 'Source type is required']
  },
  
  // IPD specific fields
  bedNumber: String,
  ward: String,
  inpatientCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InpatientCase'
  },
  
  // OPD specific fields  
  outpatientCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OutpatientCase'
  },
  
  // Service details
  requestedServices: [{
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    serviceName: {
      type: String,
      required: true
    },
    charge: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending'
    }
  }],
  
  // Clinical information
  clinicalHistory: {
    type: String,
    required: [true, 'Clinical history is required']
  },
  
  clinicalIndication: {
    type: String,
    required: [true, 'Clinical indication is required']
  },
  
  // Study details
  studyDate: {
    type: Date,
    default: Date.now
  },
  
  studyTime: {
    type: String,
    default: function() {
      return new Date().toLocaleTimeString().slice(0, 5);
    }
  },
  
  // Report sections (based on your template)
  protocol: {
    type: String,
    required: [true, 'Protocol is required']
  },
  
  observation: {
    type: String,
    required: [true, 'Observation is required']
  },
  
  impression: {
    type: String,
    required: [true, 'Impression is required']
  },
  
  // Additional findings 
  findings: {
    type: String
  },
  
  // Report status
  reportStatus: {
    type: String,
    enum: ['draft', 'preliminary', 'final', 'amended'],
    default: 'draft'
  },
  
  // Radiologist information
  consultantRadiologist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Consultant radiologist is required']
  },
  
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reported by is required']
  },
  
  // Signature
  radiologistSignature: SignatureSchema,
  
  // Referring doctor
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Payment details
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required']
  },
  
  amountReceived: {
    type: Number,
    default: 0
  },
  
  dueAmount: {
    type: Number,
    default: 0
  },
  
//   paymentMode: {
//     type: String,
//     enum: ['cash', 'card', 'upi', 'insurance', 'credit'],
//     required: [true, 'Payment mode is required']
//   },
  
  transactionId: String,
  
  isPaid: {
    type: Boolean,
    default: false
  },
  
  // Template used
  templateUsed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FindingTemplate'
  },
  
  // Priority
  urgency: {
    type: String,
    enum: ['routine', 'urgent', 'stat', 'emergency'],
    default: 'routine'
  },
  
  // Report completion
  completedAt: Date,
  
  // Remarks
  remarks: String,
  
  // Quality assurance
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  reviewedAt: Date,
  
  // Report version control
  version: {
    type: Number,
    default: 1
  },
  
  previousVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RadioInward'
  }
}, {
  timestamps: true
});

// Index for better performance
RadioInwardSchema.index({ radiologyRequestId: 1 });
RadioInwardSchema.index({ patientUhid: 1, studyDate: -1 });
RadioInwardSchema.index({ reportStatus: 1, urgency: 1 });

// Pre-save middleware to calculate due amount
RadioInwardSchema.pre('save', function(next) {
  this.dueAmount = this.totalAmount - this.amountReceived;
  this.isPaid = this.dueAmount <= 0;
  next();
});

// Create separate model for finding templates
const FindingTemplate = mongoose.model('FindingTemplate', FindingTemplateSchema);
const RadioInward = mongoose.model('RadioInward', RadioInwardSchema);

export { FindingTemplate };
export default RadioInward;
