import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  subscriptionPlan: {
    type: String,
    enum: ["free", "basic", "standard", "premium"], // adjust as needed
    required: true
  },
  status: {
    type: String,
    enum: ["active", "inactive", "expired", "pending"],
    default: "pending"
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
}, { timestamps: true });

export default mongoose.model("Subscription", SubscriptionSchema);