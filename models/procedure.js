import mongoose from "mongoose";

const procedureSchema = new mongoose.Schema({
  procedure_name: {
    type: String,
  },
  remarks: {
    type: String,
  },

  outpatientCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OutpatientCase",
    default: null,
    unique: true,
    set: (v) => (v === "" ? null : v), // 👈 convert empty string to null
  },
}, 
{timestamps: true});

const Procedure = mongoose.model("Procedure", procedureSchema);
export default Procedure;
