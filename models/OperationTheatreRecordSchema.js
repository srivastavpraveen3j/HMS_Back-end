const OperationTheatreRecordSchema = new Schema({
    uniqueHealthIdentificationId: { type: Schema.Types.ObjectId, ref: "UniqueHealthIdentification" },
    surgeryDate: { type: Date },
    surgeryStartTime: { type: String },
    surgeryEndTime: { type: String },
    wardMasterId: { type: Schema.Types.ObjectId, ref: "WardMaster" },
    performingDoctorId: { type: Schema.Types.ObjectId, ref: "User" },
    surgeryPackageId: { type: Schema.Types.ObjectId, ref: "SurgeryService" },
    anesthesiaType: { type: String },
    implantDetails: { type: String },
    equipmentUsed: { type: String },
    isHighRisk: { type: Boolean },
    netSurgeryAmount: { type: Number },
  });