// models/CaseCompanyRates.js
import mongoose from 'mongoose';

const CaseCompanyRatesSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Case ID is required']
  },
  caseType: {
    type: String,
    enum: ['IPD', 'OPD'],
    required: [true, 'Case type is required']
  },
  uhidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UHID',
    required: [true, 'UHID is required']
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyMaster',
    required: [true, 'Company ID is required']
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required']
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  // Locked service rates at time of case registration
  lockedServiceRates: [{
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    serviceName: {
      type: String,
      required: true
    },
    lockedRate: {
      type: Number,
      required: true,
      min: [0, 'Locked rate cannot be negative']
    },
    originalRate: {
      type: Number,
      required: true,
      min: [0, 'Original rate cannot be negative']
    },
    serviceType: {
      type: String,
      enum: ['ipd', 'opd', 'radiology']
    }
  }],
  // Locked bed type rates at time of case registration
  lockedBedTypeRates: [{
    bedTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BedType',
      required: true
    },
    bedTypeName: {
      type: String,
      required: true
    },
    lockedRate: {
      type: Number,
      required: true,
      min: [0, 'Locked rate cannot be negative']
    },
    originalRate: {
      type: Number,
      required: true,
      min: [0, 'Original rate cannot be negative']
    }
  }],
  // Locked room type rates at time of case registration
  lockedRoomTypeRates: [{
    roomTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: true
    },
    roomTypeName: {
      type: String,
      required: true
    },
    lockedRate: {
      type: Number,
      required: true,
      min: [0, 'Locked rate cannot be negative']
    },
    originalRate: {
      type: Number,
      required: true,
      min: [0, 'Original rate cannot be negative']
    }
  }],
  // For IPD cases - specific bed and room locked rates
  assignedBedRate: {
    bedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bed'
    },
    lockedRate: {
      type: Number,
      min: [0, 'Locked rate cannot be negative']
    }
  },
  assignedRoomRate: {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    },
    lockedRate: {
      type: Number,
      min: [0, 'Locked rate cannot be negative']
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
CaseCompanyRatesSchema.index({ caseId: 1, caseType: 1 });
CaseCompanyRatesSchema.index({ uhidId: 1 });
CaseCompanyRatesSchema.index({ companyId: 1 });
CaseCompanyRatesSchema.index({ registrationDate: -1 });

// Compound index for unique case-company combination
CaseCompanyRatesSchema.index({ caseId: 1, companyId: 1 }, { unique: true });

// Virtual to get total locked services count
CaseCompanyRatesSchema.virtual('totalLockedServices').get(function() {
  return this.lockedServiceRates.length;
});

// Virtual to get total locked bed types count
CaseCompanyRatesSchema.virtual('totalLockedBedTypes').get(function() {
  return this.lockedBedTypeRates.length;
});

// Virtual to get total locked room types count
CaseCompanyRatesSchema.virtual('totalLockedRoomTypes').get(function() {
  return this.lockedRoomTypeRates.length;
});

// Virtual to get total savings
CaseCompanyRatesSchema.virtual('totalSavings').get(function() {
  let savings = 0;
  this.lockedServiceRates.forEach(rate => {
    savings += (rate.originalRate - rate.lockedRate);
  });
  this.lockedBedTypeRates.forEach(rate => {
    savings += (rate.originalRate - rate.lockedRate);
  });
  this.lockedRoomTypeRates.forEach(rate => {
    savings += (rate.originalRate - rate.lockedRate);
  });
  return savings;
});

export default mongoose.model('CaseCompanyRates', CaseCompanyRatesSchema);

