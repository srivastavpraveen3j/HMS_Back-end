import OperationTheatresheet from "../models/OTsheet.js";
import Surgerypackage from "../models/Surgerypackage.js";
import UHID from "../models/uhid.js";

// CREATE (multiple surgery packages, no inpatientCaseId uniqueness check!)
// export const createOprationTheater = async (OTsheet) => {
//   if (!Array.isArray(OTsheet.surgeryPackageIds) || OTsheet.surgeryPackageIds.length === 0)
//     throw new Error("surgeryPackageIds is required in the payload");
//   const surgeryPackages = [];
//   for (const pkgId of OTsheet.surgeryPackageIds) {
//     const pkgDoc = await Surgerypackage.findById(pkgId).lean();
//     if (!pkgDoc) throw new Error("Surgery package not found: " + pkgId);
//     surgeryPackages.push(pkgDoc);
//   }
//   OTsheet.surgeryPackages = surgeryPackages;
//   const newOTsheet = await OperationTheatresheet.create(OTsheet);
//   return newOTsheet;
// };


export const createOprationTheater = async (OTsheet) => {
  // Only require surgeryPackageIds if manualEntryEnabled is NOT true
  if (!OTsheet.manualEntryEnabled) {
    if (!Array.isArray(OTsheet.surgeryPackageIds) || OTsheet.surgeryPackageIds.length === 0) {
      throw new Error("surgeryPackageIds is required in the payload");
    }
    const surgeryPackages = [];
    for (const pkgId of OTsheet.surgeryPackageIds) {
      const pkgDoc = await Surgerypackage.findById(pkgId).lean();
      if (!pkgDoc) throw new Error("Surgery package not found: " + pkgId);
      surgeryPackages.push(pkgDoc);
    }
    OTsheet.surgeryPackages = surgeryPackages;
  }
  // If in manual mode, skip package handling

  const newOTsheet = await OperationTheatresheet.create(OTsheet);
  return newOTsheet;
};


export const getAllOprationTheaters = async ({ page, limit, matchStage }) => {
  const OTsheets = await UHID.aggregate([
    {
      $lookup: {
        from: "operationtheatresheets",
        localField: "_id",
        foreignField: "uniqueHealthIdentificationId",
        as: "operationTheatresheets",
      },
    },
    { $unwind: "$operationTheatresheets" },
    {
      $lookup: {
        from: "inpatientcases",
        localField: "_id",
        foreignField: "uniqueHealthIdentificationId",
        as: "inpatientCases",
        pipeline: [
          {
            $lookup: {
              from: "doctors",
              localField: "admittingDoctorId",
              foreignField: "_id",
              as: "admittingDoctorId",
            },
          },
          { $unwind: "$admittingDoctorId" },
          {
            $lookup: {
              from: "wardmasters",
              localField: "wardMasterId",
              foreignField: "_id",
              as: "wardMasterId",
            },
          },
          { $unwind: "$wardMasterId" },
          {
            $lookup: {
              from: "rooms",
              localField: "room_id",
              foreignField: "_id",
              as: "room_id",
            },
          },
          {
            $lookup: {
              from: "beds",
              localField: "bed_id",
              foreignField: "_id",
              as: "bed_id",
            },
          },
          { $unwind: "$bed_id" },
        ],
      },
    },
    {
      $match: {
        operationTheatresheets: { $ne: [] },
        ...(matchStage || {}),
      },
    },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ]);
  return OTsheets;
};

export const getOprationTheaterByCase = async (inpatientCaseId) => {
  // Now return ALL for the case, not just first match:
  return await OperationTheatresheet.find({ inpatientCaseId })
    .populate("inpatientCaseId")
    .populate("uniqueHealthIdentificationId")
    .populate("createdBy")
    .populate("surgeryPackageIds");
};

export const getOperationTheatreSheetById = async (id) => {
  return await OperationTheatresheet.findById(id)
    .populate("uniqueHealthIdentificationId inpatientCaseId createdBy")
    .populate("surgeryPackageIds");
};

export const updateOprationTheater = async (id, OTsheet) => {
  if (OTsheet.surgeryPackageIds && Array.isArray(OTsheet.surgeryPackageIds)) {
    const surgeryPackages = [];
    for (const pkgId of OTsheet.surgeryPackageIds) {
      const pkgDoc = await Surgerypackage.findById(pkgId).lean();
      if (!pkgDoc) throw new Error("Surgery package not found: " + pkgId);
      surgeryPackages.push(pkgDoc);
    }
    OTsheet.surgeryPackages = surgeryPackages;
  }
  const updatedOTsheet = await OperationTheatresheet.findByIdAndUpdate(id, OTsheet, { new: true });
  return updatedOTsheet;
};

export const deleteOprationTheater = async (id) => {
  return await OperationTheatresheet.findByIdAndDelete(id);
};
