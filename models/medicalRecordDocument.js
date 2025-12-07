import mongoose from "mongoose";

const medicalRecordDocument = new mongoose.Schema({
    outpatientCaseId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Outpatient Case (Opdcase)
        ref: 'OutpatientCase',
        required: [true, "Outpatient case ID is required"],
    },
    caseNumber: {
        type: mongoose.Schema.Types.ObjectId, // Reference to UHID (Unique Hospital Identification)
        ref: 'UHID',
        required: [true, "Case number is required"],
    },
    recordFile: {
        type: Buffer, // You can store the file as binary or a file path
        required: [true, "Record file is required"],
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
});

const medicalRecord = mongoose.model('MedicalRecordDocument', medicalRecordDocument);
export default medicalRecord;