
// models/CompanyMaster.js
import mongoose from 'mongoose';

const CompanyMasterSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Cashless', 'Credit', 'Corporate', 'Cash'],
    required: [true, 'Company type is required']
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  companyShortName: {
    type: String,
    required: [true, 'Company short name is required'],
    trim: true,
    maxlength: [50, 'Company short name cannot exceed 50 characters']
  },
  tpaName: {
    type: String,
    trim: true,
    maxlength: [200, 'TPA name cannot exceed 200 characters']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  city: {
    type: String,
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone cannot exceed 20 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefaultHospitalName: {
    type: Boolean,
    default: false
  },
  doNotCalculateIPDServiceCharges: {
    type: Boolean,
    default: false
  },
  cashlessFormDownloadLink: {
    type: String,
    trim: true
  },
  takeRateOfCompany: {
    type: String,
    trim: true
  },
  // Company-specific rates for services
  serviceRates: [{
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    customRate: {
      type: Number,
      required: true,
      min: [0, 'Custom rate cannot be negative']
    },
    effectiveDate: {
      type: Date,
      default: Date.now
    }
  }],
  // Company-specific rates for bed types
  bedTypeRates: [{
    bedTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BedType',
      required: true
    },
    customRate: {
      type: Number,
      required: true,
      min: [0, 'Custom rate cannot be negative']
    },
    effectiveDate: {
      type: Date,
      default: Date.now
    }
  }],
  // Company-specific rates for room types
  roomTypeRates: [{
    roomTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: true
    },
    customRate: {
      type: Number,
      required: true,
      min: [0, 'Custom rate cannot be negative']
    },
    effectiveDate: {
      type: Date,
      default: Date.now
    }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
CompanyMasterSchema.index({ companyName: 1 });
CompanyMasterSchema.index({ type: 1, isActive: 1 });
CompanyMasterSchema.index({ companyShortName: 1 });

// Virtual for full company display name
CompanyMasterSchema.virtual('displayName').get(function() {
  return `${this.companyName} (${this.companyShortName})`;
});

// Virtual for total rates count
CompanyMasterSchema.virtual('totalRatesCount').get(function() {
  return this.serviceRates.length + this.bedTypeRates.length + this.roomTypeRates.length;
});

export default mongoose.model('CompanyMaster', CompanyMasterSchema);
