import mongoose from "mongoose";
import Counter from "./counter.js"; // Adjust path if needed

const uhidSchema = new mongoose.Schema({
  patient_name: {
    type: String,
    required: [true, 'Patient name is required'],
  },
  isCaseExist: {
    type: Boolean,
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function (value) {
        return value <= new Date();
      },
      message: 'Date of birth cannot be in the future',
    },
  },
  age: {
    type: String,
  },
  dor: {
    type: Date,
    validate: {
      validator: function (v) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(v);
        inputDate.setHours(0, 0, 0, 0);
        return inputDate.getTime() === today.getTime();
      },
      message: 'Date of registration must be today',
    },
  },
  dot: {
    type: String,
  },
  mobile_no: {
    type: String,
  },
  address: {
    type: String,
  },
  area: {
    type: String,
  },
  pincode: {
    type: Number,
  },
  uhid: {
    type: String,
    unique: true,
  },
});

// 👇 Pre-save hook to assign a sequential UHID
// uhidSchema.pre("save", async function (next) {
//   if (this.isNew && !this.uhid) {
//     const now = new Date();
//     const currentYY = String(now.getFullYear()).slice(-2); // e.g. '25'
//     const nextYY = String(now.getFullYear() + 1).slice(-2); // e.g. '26'
//     const yearKey = `${currentYY}${nextYY}`; // e.g. '2526'

//     const counterDoc = await Counter.findOneAndUpdate(
//       { module: "UHID", year: yearKey },
//       { $inc: { value: 1 } },
//       { new: true, upsert: true }
//     );

//     const counterStr = String(counterDoc.value).padStart(4, "0");
//     this.uhid = `${yearKey}/${counterStr}`; // e.g. 2526/0001
//   }
//   next();
// });


uhidSchema.pre("save", async function (next) {
  if (this.isNew && !this.uhid) {
    const counterDoc = await Counter.findOneAndUpdate(
      { module: "UHID" },             // Remove year from key
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    const counterStr = String(counterDoc.value).padStart(4, "0");
    this.uhid = counterStr;           // e.g. '0001'
  }
  next();
});

const UHID = mongoose.model("UHID", uhidSchema);
export default UHID;
