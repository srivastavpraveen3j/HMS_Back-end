// models/RadiologyRequest.js
import mongoose from 'mongoose';

const RequestedServiceSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required']
  },
  serviceName: {
    type: String,
    required: [true, 'Service name is required']
  },
  charge: {
    type: Number,
    required: [true, 'Charge is required']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  completedDate: {
    type: Date
  },
  results: {
    type: String
  },
  reportUrl: {
    type: String // For storing report file URL
  }
});

const RadiologyRequestSchema = new mongoose.Schema({
  // Request identification
  requestNumber: {
    type: String,
    unique: true,
    required: [true, 'Request number is required']
  },
  
  // Patient information
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
    type: String,
    required: [true, 'Age is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  
  // Source of request (OPD or IPD)
  sourceType: {
    type: String,
    enum: ['opd', 'ipd'],
    required: [true, 'Source type is required']
  },
  
  // OPD specific fields
  opdBillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OutpatientBill',
    required: function() {
      return this.sourceType === 'opd';
    }
  },
  outpatientCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OutpatientCase',
    required: function() {
      return this.sourceType === 'opd';
    }
  },
  
  // IPD specific fields
  ipdBillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InpatientBill',
    required: function() {
      return this.sourceType === 'ipd';
    }
  },
  inpatientCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InpatientCase',
    required: function() {
      return this.sourceType === 'ipd';
    }
  },
  bedNumber: {
    type: String,
    required: function() {
      return this.sourceType === 'ipd';
    }
  },
//   ward: {
//     type: String,
//     required: function() {
//       return this.sourceType === 'ipd';
//     }
//   },
  
  // Request details
  consultingDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Consulting doctor is required']
  },
  requestDate: {
    type: Date,
    default: Date.now,
    required: [true, 'Request date is required']
  },
  requestTime: {
    type: String,
    required: [true, 'Request time is required']
  },
  
  // Clinical information
  clinicalHistory: {
    type: String,
    required: [true, 'Clinical history is required']
  },
  clinicalIndication: {
    type: String,
    required: [true, 'Clinical indication is required']
  },
  urgency: {
    type: String,
    enum: ['routine', 'urgent', 'stat', 'emergency'],
    default: 'routine'
  },
  
  // Radiology services requested
  requestedServices: [RequestedServiceSchema],
  
  // Request status
  overallStatus: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Technician assignment
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedDate: {
    type: Date
  },
  
  // Radiologist assignment
  assignedRadiologist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Billing information
  totalAmount: {
    type: Number,
    // required: [true, 'Total amount is required']
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  
  // Additional notes
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

// Auto-generate request number
RadiologyRequestSchema.pre('save', async function(next) {
  if (!this.requestNumber) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    
    // Count requests for today to generate unique number
    const todayStart = new Date(currentDate.setHours(0, 0, 0, 0));
    const todayEnd = new Date(currentDate.setHours(23, 59, 59, 999));
    
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });
    
    this.requestNumber = `RAD${year}${month}${day}${String(count + 1).padStart(4, '0')}`;
  }
  
  // Calculate total amount
  if (this.requestedServices && this.requestedServices.length > 0) {
    this.totalAmount = this.requestedServices.reduce((total, service) => {
      return total + service.charge;
    }, 0);
  }
  
  next();
});

// Index for better query performance
RadiologyRequestSchema.index({ 
  sourceType: 1, 
  overallStatus: 1, 
  requestDate: -1 
});

RadiologyRequestSchema.index({ patientUhid: 1, requestDate: -1 });

const RadiologyRequest = mongoose.model('RadiologyRequest', RadiologyRequestSchema);
export default RadiologyRequest;
