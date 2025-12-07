  // import mongoose from 'mongoose';

  // const serviceSchema = new mongoose.Schema({
  //   name: {
  //     type: String,
  //     required: [true, 'Name is required'],
  //     trim: true,
  //   },
  //   charge: {
  //     type: Number,
  //     required: [true, 'Charge is required'],
  //   },
  //   type: {
  //     type: String,
  //     enum: ['ipd', 'opd', 'radiology'],
  //     required: [true, 'Type is required'],
  //   }
  // });

  // export default mongoose.model('Service', serviceSchema);
  // models/Service.js
  import mongoose from 'mongoose';

  const serviceSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    charge: {
      type: Number,
      required: [true, 'Charge is required'],
      min: [0, 'Charge cannot be negative']
    },
    type: {
      type: String,
      enum: ['ipd', 'opd', 'radiology'],
      required: [true, 'Type is required'],
    },
    
    // ✅ NEW FIELDS FOR TIME-BASED BILLING
    billingType: {
      type: String,
      enum: ['fixed', 'hourly', 'daily', 'session', 'quantity'],
      default: 'fixed',
      required: true
    },
    ratePerUnit: {
      type: Number,
      min: [0, 'Rate per unit cannot be negative'],
      // When billingType is 'fixed', ratePerUnit equals charge
      // When billingType is not 'fixed', this is the per-unit rate
    },
    unitLabel: {
      type: String,
      default: 'service',
      // Examples: 'hour', 'day', 'session', 'injection', 'unit', 'test'
    },
    minUnits: {
      type: Number,
      default: 1,
      min: [0, 'Minimum units cannot be negative']
    },
    maxUnits: {
      type: Number,
      default: null, // null means no maximum limit
    },
    description: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }, {
    timestamps: true
  });

  // ✅ Pre-save hook to ensure ratePerUnit is set
  serviceSchema.pre('save', function(next) {
    if (this.billingType === 'fixed' && !this.ratePerUnit) {
      this.ratePerUnit = this.charge;
    }
    if (this.billingType === 'fixed' && !this.unitLabel) {
      this.unitLabel = 'service';
    }
    next();
  });

  export default mongoose.model('Service', serviceSchema);
