import mongoose from 'mongoose';

const BranchSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 100
  },
  api_key: {
    type: String,
    required: [true, 'API KEY is required'],
  },
  contact_email: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    maxlength: 20
  },
  address: {
    type: String,
    maxlength: 300
  },
  is_active: {
    type: Boolean,
    default: false
  },
  subscription_plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  created_at: {
    type: Date,
    default: () => Date.now()
  },
  updated_at: {
    type: Date,
    default: () => Date.now()
  }
});

export default mongoose.model('Branch', BranchSchema);