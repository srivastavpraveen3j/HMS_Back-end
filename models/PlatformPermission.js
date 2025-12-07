import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Permission name is required'],
      unique: true,
      trim: true // e.g., "view_users", "edit_patients"
    },
    description: {
      type: String,
      default: ''
    },
    action: {
      type: [String],
      enum: ['view', 'create', 'edit', 'delete', 'approve', 'manage'],
      required: [true, 'Action type is required']
    }
  },
  { timestamps: true }
);

// ✅ fixed typo: "PlatformPermission"
export default mongoose.model('PlatformPermission', permissionSchema);