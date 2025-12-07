import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  dateTime: {
    type: Date,
    default: Date.now,
  },
  changedBy: String,
  action: String,
  affectedRule: { type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }, 
  oldValue: String,
  newValue: String,
});

const ReferralAudit = mongoose.model("ReferralAudit", auditSchema);
export default ReferralAudit;
