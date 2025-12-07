import Vitals from "../models/vitals.js";
import UHID from "../models/uhid.js";

export const createVitals = async (data) => {
  return await Vitals.create(data);
};

export const getAllVitals = async ({ limit, page, params }) => {
  const { query } = params;
  return await UHID.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "vitals",
        localField: "_id",
        foreignField: "uniqueHealthIdentificationId",
        as: "vitals",
      },
    },
  ]);
};

export const getVitalsById = async (id) => {
  return await Vitals.findOne({ _id: id })
    .populate("uniqueHealthIdentificationId")   // UHID reference
    .populate("inpatientCaseId")                // Inpatient reference
    .populate("outpatientCaseId");              // Outpatient reference
};

export const updateVitals = async (id, data) => {
  return await Vitals.findOneAndUpdate({ _id: id }, data, { new: true });
};

export const deleteVitals = async (id) => {
  return await Vitals.findOneAndDelete({ _id: id });
};

export const getVitalsByCase = async ({ outpatientCaseId, inpatientCaseId }) => {
  const filter = {};

  if (outpatientCaseId) {
    filter.outpatientCaseId = outpatientCaseId;
  }

  if (inpatientCaseId) {
    filter.inpatientCaseId = inpatientCaseId;
  }

  return await Vitals.find(filter)
    .populate("uniqueHealthIdentificationId", "uhid patientName")
    .populate("outpatientCaseId")
    .populate("inpatientCaseId createdBy")
    .lean();
};