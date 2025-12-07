import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    redirectUrl: {
      type: String,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed, // for extra contextual data
      default: {},
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export default mongoose.model('Notification', notificationSchema);