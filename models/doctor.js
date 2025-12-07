import mongoose from 'mongoose';
import bcrypt from "bcryptjs";

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  mobile_no: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
  },
  // address: {
  //   type: String,
  //   required: [true, 'Address is required'],
  //   trim: true,
  // },
  // dob: {
  //   type: Date,
  //   required: [true, 'Date of birth is required'],
  // },
  // sign: {
  //   type: String,
  //   required: [true, 'Signature is required'],
  //   trim: true,
  // },
  // dr_type: {
  //   type: String,
  //   enum: ['superSpecialist', 'doctor'],
  //   required: [true, 'Dr type is required'],
  // },
  // type: {
  //   type: String,
  //   enum: ['consulting', 'referring', 'both'],
  //   required: [true, 'Type is required'],
  // },
  // reg_no: {
  //   type: String,
  //   required: [true, 'Registration number is required'],
  //   trim: true,
  // },
  // degree: {
  //   type: String,
  //   required: [true, 'Degree is required'],
  //   trim: true,
  // },
  // speciality: {
  //   type: String,
  //   required: [true, 'Speciality is required'],
  //   trim: true,
  // },
  // specialization: {
  //   type: String,
  //   required: [true, 'Specialization is required'],
  //   trim: true,
  // },
  // qualifications: {
  //   type: String,
  //   required: [true, 'Qualifications is required'],
  //   trim: true,
  // },
  // experience: {
  //   type: String,
  //   required: [true, 'Experience is required'],
  //   trim: true,
  // },
  // pan_no: {
  //   type: String,
  //   required: [true, 'PAN number is required'],
  //   trim: true,
  //   match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  // },
  // email: {
  //   type: String,
  //   required: [true, 'Email is required'],
  //   unique: true,
  //   trim: true,
  //   match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$/
  // },
  // status: {
  //   type: String,
  //   enum: ['ACTIVE', 'INACTIVE'],
  //   default: 'ACTIVE',
  // },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  // password: {
  //   type: String,
  //   required: true,
  //   select: false,
  // },
});

// doctorSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;