const InpatientRoomTransferSchema = new Schema({
    uniqueHealthIdentificationId: { type: Schema.Types.ObjectId, ref: "UniqueHealthIdentification" },
    wardMasterId: { type: Schema.Types.ObjectId, ref: "WardMaster" },
    inpatientCaseId: { type: Schema.Types.ObjectId, ref: "InpatientCase" },
  });