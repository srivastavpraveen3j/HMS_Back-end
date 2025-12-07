import mongoose from 'mongoose';

const packageBreakdownSchema = new mongoose.Schema({
  chargeType:   { type: String, required: true },   // Doctor Charges, OT, etc.
  amount:       { type: Number, required: true },
  percentage:   { type: Number, required: true }
}, { _id: false });

const roomWiseBreakdownSchema = new mongoose.Schema({
  roomTypeId:      { type: mongoose.Schema.Types.ObjectId, ref: "RoomType", required: true },
  roomName:        { type: String, required: true },
  roomDescription: { type: String },
  roomPrice:       { type: Number, required: true },
  packagePrice:    { type: Number, required: true },
  // breakdown is OPTIONAL for a row, just remove required: true
  breakdown:       { type: [packageBreakdownSchema], default: undefined }
}, { _id: false });

const SurgeryPackageOperation = new mongoose.Schema({
  name:           { type: String, required: true },
  totalPrice:     { type: Number, required: true },
  duration:       { type: Number },
  status:         { type: String, enum: ['Active','Inactive'], default: 'Active' },
  type:              { type: String },     // surgery category from surgerymaster (e.g. 'Gynecology', 'Urology')
  note:              { type: String },  
  // Make both master breakdown and roomWiseBreakdown optional arrays
  breakdown:         { type: [packageBreakdownSchema], default: undefined },
  roomWiseBreakdown: { type: [roomWiseBreakdownSchema], default: undefined }
},{ timestamps: true });

export default mongoose.model('Surgerypackage', SurgeryPackageOperation);
