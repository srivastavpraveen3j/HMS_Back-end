import PharmaceuticalRequestListSchema from "../models/PharmaceuticalRequestListSchema.js";
import PharmaceuticalRequestperscription from "../models/PharmaceuticalRequestperscription.js";
import UHID from "../models/uhid.js";

export const createPharmaceuticalRequestList = async (
  pharmaceuticalRequestList
) => {
  const requestList = await PharmaceuticalRequestListSchema.create(
    pharmaceuticalRequestList
  );
  return requestList;
};

export const getAllPharmaceuticalRequestList = async ({ page, limit, matchStage }) => {

  const requestList = await UHID.aggregate([
    {
      $lookup: {
        from: "pharmaceuticalrequestlists",
        localField: "_id",
        foreignField: "uniqueHealthIdentificationId",
        as: "pharmaceuticalrequestlists",
      },
    },
    {
      $match: matchStage,
    },
    {
      $unwind: "$pharmaceuticalrequestlists",
    },
    {
      $lookup: {
        from: "inpatientcases",
        localField: "pharmaceuticalrequestlists.inpatientCaseUniqueId",
        foreignField: "_id",
        as: "inpatientCase",
      },
    },
    { $unwind: { path: "$inpatientCase", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "wardmasters",
        localField: "inpatientCase.wardMasterId",
        foreignField: "_id",
        as: "wardMaster",
      },
    },
    { $unwind: { path: "$wardMaster", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "rooms",
        localField: "inpatientCase.room_id",
        foreignField: "_id",
        as: "room",
      },
    },
    { $unwind: { path: "$room", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "beds",
        localField: "inpatientCase.bed_id",
        foreignField: "_id",
        as: "bed",
      },
    },
    { $unwind: { path: "$bed", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "doctors",
        localField: "inpatientCase.admittingDoctorId",
        foreignField: "_id",
        as: "admittingDoctor",
      },
    },
    { $unwind: { path: "$admittingDoctor", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        "pharmaceuticalrequestlists.inpatientCaseDetails": {
          ...{
            _id: "$inpatientCase._id",
            uniqueHealthIdentificationId:
              "$inpatientCase.uniqueHealthIdentificationId",
            admittingDoctor: "$admittingDoctor",
            wardMaster: "$wardMaster",
            room: "$room",
            bed: "$bed",
            isDischarge: "$inpatientCase.isDischarge",
            isMedicoLegalCase: "$inpatientCase.isMedicoLegalCase",
            admissionDate: "$inpatientCase.admissionDate",
            admissionTime: "$inpatientCase.admissionTime",
            createdAt: "$inpatientCase.createdAt",
            updatedAt: "$inpatientCase.updatedAt",
          },
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        patient_name: { $first: "$patient_name" },
        gender: { $first: "$gender" },
        dob: { $first: "$dob" },
        age: { $first: "$age" },
        dor: { $first: "$dor" },
        dot: { $first: "$dot" },
        mobile_no: { $first: "$mobile_no" },
        area: { $first: "$area" },
        pincode: { $first: "$pincode" },
        uhid: { $first: "$uhid" },
        pharmaceuticalrequestlists: { $push: "$pharmaceuticalrequestlists" },
      },
    },
     {
      $skip: (page - 1) * limit,
    },
    { $limit: limit || 50 },
  ]);

  return requestList;
};


export const getPharmaceuticalRequestList = async (id) => {
  const requestList = await PharmaceuticalRequestListSchema.find({ _id: id });
  return requestList;
};

export const updatePharmaceuticalRequestList = async (
  id,
  pharmaceuticalRequestList
) => {
  const requestList = await PharmaceuticalRequestListSchema.findOneAndUpdate(
    { _id: id },
    pharmaceuticalRequestList,
    { new: true }
  );
  return requestList;
};

export const deletePharmaceuticalRequestList = async (id) => {
  const requestList = await PharmaceuticalRequestListSchema.findOneAndDelete({
    _id: id,
  });
  return requestList;
};



export const getPharmaceuticalRequestByCase = async ({
  outpatientCaseId,
  inpatientCaseId,
}) => {
  const filter = {};

  // Build filter based on provided case IDs
  if (outpatientCaseId) {
    filter.outpatientCaseUniqueId = outpatientCaseId;
  }

  if (inpatientCaseId) {
    filter.inpatientCaseUniqueId = inpatientCaseId;
  }

  console.log('🔍 Filter:', filter); // Debug log

  try {
    const results = await PharmaceuticalRequestListSchema.find(filter) // ✅ Use Model, not Schema
      .populate("uniqueHealthIdentificationId", "uhid patient_name mobile_no age gender")
      .populate({
        path: "outpatientCaseUniqueId",
        populate: [
          { path: "consulting_Doctor", select: "name specialization" },
          { path: "referringDoctorId", select: "name specialization" },
          { path: "uniqueHealthIdentificationId", select: "uhid patient_name" }
        ],
      })
      .populate({
        path: "inpatientCaseUniqueId",
        populate: [
          { path: "admittingDoctorId", select: "name specialization" },
          { path: "referringDoctorId", select: "name specialization" },
          { path: "uniqueHealthIdentificationId", select: "uhid patient_name" },
          { path: "bed_id", select: "bed_number ward_id" }
        ],
      })
      .populate("pharmacistUserId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    console.log('📋 Query results:', results); // Debu  g log
    return results;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
};


// without ipd pharma permsison services

export const createwithoutIPDpermissionPharmaceuticalRequestList = async (
  PharmaceuticalRequestPrescription
) => {
  const requestList = await PharmaceuticalRequestperscription.create(
    PharmaceuticalRequestPrescription
  );
  return requestList;
};
export const getAllwithoutIPDpermissionPharmaceuticalRequestList = async ({ page, limit, matchStage }) => {

  const requestList = await UHID.aggregate([
    {
      $lookup: {
        from: "PharmaceuticalRequestPrescription",
        localField: "_id",
        foreignField: "uniqueHealthIdentificationId",
        as: "PharmaceuticalRequestPrescription",
      },
    },
    {
      $match: matchStage,
    },
    {
      $unwind: "$PharmaceuticalRequestPrescription",
    },
    {
      $lookup: {
        from: "inpatientcases",
        localField: "PharmaceuticalRequestPrescription.inpatientCaseUniqueId",
        foreignField: "_id",
        as: "inpatientCase",
      },
    },
    { $unwind: { path: "$inpatientCase", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "wardmasters",
        localField: "inpatientCase.wardMasterId",
        foreignField: "_id",
        as: "wardMaster",
      },
    },
    { $unwind: { path: "$wardMaster", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "rooms",
        localField: "inpatientCase.room_id",
        foreignField: "_id",
        as: "room",
      },
    },
    { $unwind: { path: "$room", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "beds",
        localField: "inpatientCase.bed_id",
        foreignField: "_id",
        as: "bed",
      },
    },
    { $unwind: { path: "$bed", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "doctors",
        localField: "inpatientCase.admittingDoctorId",
        foreignField: "_id",
        as: "admittingDoctor",
      },
    },
    { $unwind: { path: "$admittingDoctor", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        "PharmaceuticalRequestPrescription.inpatientCaseDetails": {
          ...{
            _id: "$inpatientCase._id",
            uniqueHealthIdentificationId:
              "$inpatientCase.uniqueHealthIdentificationId",
            admittingDoctor: "$admittingDoctor",
            wardMaster: "$wardMaster",
            room: "$room",
            bed: "$bed",
            isDischarge: "$inpatientCase.isDischarge",
            isMedicoLegalCase: "$inpatientCase.isMedicoLegalCase",
            admissionDate: "$inpatientCase.admissionDate",
            admissionTime: "$inpatientCase.admissionTime",
            createdAt: "$inpatientCase.createdAt",
            updatedAt: "$inpatientCase.updatedAt",
          },
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        patient_name: { $first: "$patient_name" },
        gender: { $first: "$gender" },
        dob: { $first: "$dob" },
        age: { $first: "$age" },
        dor: { $first: "$dor" },
        dot: { $first: "$dot" },
        mobile_no: { $first: "$mobile_no" },
        area: { $first: "$area" },
        pincode: { $first: "$pincode" },
        uhid: { $first: "$uhid" },
        PharmaceuticalRequestPrescription: { $push: "$PharmaceuticalRequestPrescription" },
      },
    },
     {
      $skip: (page - 1) * limit,
    },
    { $limit: limit || 50 },
  ]);

  return requestList;
};


export const getwithoutIPDpermissionPharmaceuticalRequestList = async (id) => {
  const requestList = await PharmaceuticalRequestperscription.find({ _id: id });
  return requestList;
};


export const updatewithoutIPDpermissionPharmaceuticalRequestList = async (
  id,
  PharmaceuticalRequestPrescription
) => {
  const requestList = await PharmaceuticalRequestperscription.findOneAndUpdate(
    { _id: id },
    PharmaceuticalRequestPrescription,
    { new: true }
  );
  return requestList;
};

export const deletewithoutIPDpermissionPharmaceuticalRequestList = async (id) => {
  const requestList = await PharmaceuticalRequestperscription.findOneAndDelete({
    _id: id,
  });
  return requestList;
};


export const getwithoutIPDpermissionPharmaceuticalRequestByCase = async ({
  outpatientCaseId,
  inpatientCaseId,
}) => {
  const filter = {};

  // Build filter based on provided case IDs
  if (outpatientCaseId) {
    filter.outpatientCaseUniqueId = outpatientCaseId;
  }

  if (inpatientCaseId) {
    filter.inpatientCaseUniqueId = inpatientCaseId;
  }

  console.log('🔍 Filter:', filter); // Debug log

  try {
    const results = await PharmaceuticalRequestperscription.find(filter) // ✅ Use Model, not Schema
      .populate("uniqueHealthIdentificationId", "uhid patient_name mobile_no age gender")
      .populate({
        path: "outpatientCaseUniqueId",
        populate: [
          { path: "consulting_Doctor", select: "name specialization" },
          { path: "referringDoctorId", select: "name specialization" },
          { path: "uniqueHealthIdentificationId", select: "uhid patient_name" }
        ],
      })
      .populate({
        path: "inpatientCaseUniqueId",
        populate: [
          { path: "admittingDoctorId", select: "name specialization" },
          { path: "referringDoctorId", select: "name specialization" },
          { path: "uniqueHealthIdentificationId", select: "uhid patient_name" },
          { path: "bed_id", select: "bed_number ward_id" }
        ],
      })
      .populate("pharmacistUserId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    console.log('📋 Query results:', results); // Debu  g log
    return results;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
};