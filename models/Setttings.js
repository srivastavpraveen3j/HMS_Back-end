import mongoose from 'mongoose';

const tenantSettingsSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant is required'],
    unique: true
  },

  // Branding
  hospital_name: { type: String, required: [true, 'Hospital name is required'] },
  logo_url: { type: String },

  // Modules Enabled
  modules: {
    opd: { type: Boolean, default: true },
    ipd: { type: Boolean, default: true },
    pharmacy: { type: Boolean, default: false },
    lab_tests: { type: Boolean, default: false }
  },

  // Billing
  billing: {
    tax_percentage: { type: Number, default: 0 },
    enable_insurance: { type: Boolean, default: false }
  },

  // Notifications
  notifications: {
    send_email: { type: Boolean, default: false },
    send_sms: { type: Boolean, default: false }
  },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model('TenantSettings', tenantSettingsSchema);
