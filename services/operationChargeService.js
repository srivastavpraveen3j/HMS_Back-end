import OperationCharge from "../models/OperationCharge.js";

// Create new
export const createOperationCharge = (data, user) =>
  OperationCharge.create({ ...data, createdBy: user._id });

// Get all with pagination & search
export const getAllOperationCharges = async ({ page = 1, limit = 10, matchStage = {} }) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const stages = [
    { $match: matchStage },
    {
      $lookup: {
        from: "uhids",
        localField: "uniqueHealthIdentificationId",
        foreignField: "_id",
        as: "uniqueHealthIdentificationId"
      }
    }, { $unwind: "$uniqueHealthIdentificationId" },
    {
      $lookup: {
        from: "inpatientcases",
        localField: "inpatientCaseId",
        foreignField: "_id",
        as: "inpatientCaseId"
      }
    }, { $unwind: "$inpatientCaseId" },
    { $lookup: { // link to OT operation
      from: "operationtheatresheets",
      localField: "operationId",
      foreignField: "_id",
      as: "operationInfo"
    }},
    { $unwind: { path: "$operationInfo", preserveNullAndEmptyArrays: true } },
    { $lookup: { // link to package master
      from: "surgerypackages",
      localField: "packageId",
      foreignField: "_id",
      as: "packageInfo"
    }},
    { $unwind: { path: "$packageInfo", preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: parseInt(limit) }
  ];

  const [items, totalDocs] = await Promise.all([
    OperationCharge.aggregate(stages),
    OperationCharge.countDocuments(matchStage)
  ]);
  return {
    items,
    page: parseInt(page),
    limit: parseInt(limit),
    totalDocs,
    totalPages: Math.ceil(totalDocs / limit)
  };
};

export const getOperationChargeById = (id) =>
  OperationCharge.findById(id)
    .populate("uniqueHealthIdentificationId")
    .populate("inpatientCaseId")
    .populate("operationId")         // link to OT operation with details
    .populate("packageId")           // link to package master with details
    .populate("entries.staffId")
    .populate("createdBy");

// Update
export const updateOperationCharge = (id, data) =>
  OperationCharge.findByIdAndUpdate(id, data, { new: true, runValidators: true });

// Delete
export const deleteOperationCharge = (id) =>
  OperationCharge.findByIdAndDelete(id);

// Get by inpatientCaseId (all for this inpatient case)
export const getOperationChargeByCase = (inpatientCaseId) =>
  OperationCharge.find({ inpatientCaseId })
    .populate("uniqueHealthIdentificationId")
    .populate("inpatientCaseId")
    .populate("operationId")
    .populate("packageId")
    .populate("entries.staffId")
    .populate("createdBy");
