import mongoose from 'mongoose';

// Schema to define the structure for platform roles
const PlatformRoleSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], unique: true }, // Role name, e.g., "superadmin", "admin"
  description: { type: String, required: [true, 'Description is required'] }, // Detailed description of the role
  PlatformPermission: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PlatformPermission' }],
  isSuperAdmin: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model('PlatformRole', PlatformRoleSchema);