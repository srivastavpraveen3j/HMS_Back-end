import sharedpatientCase from "../models/sharedPatientCases.js";

export const getAllSharedData = async ({ limit, page, params }) => {
  try {
    const { query } = params;
    const data = await sharedpatientCase
      .find()
      .populate([
        { path: "uniqueHealthIdentificationId" },
        { path: "referringDoctorId" },
        { path: "consulting_Doctor" },
        { path: "wardMasterId" },
        {
          path: "room_id",
          populate: { path: "room_type_id" },
          select: "-bed_id",
        },
        { path: "bed_id", populate: { path: "bed_type_id" } },
        { path: "medicoLegalCaseId" },
      ])
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await sharedpatientCase.countDocuments(query);
    return {
      total,
      totalPages: Math.ceil(total / limit),
      limit,
      page,
      data,
    };
  } catch (error) {
    throw new Error("Error retrieving shared data: " + error.message);
  }
};

export const getSharedDataById = async (id) => {
  try {
    return await sharedpatientCase.findById(id).populate([
      { path: "uniqueHealthIdentificationId" },
      { path: "referringDoctorId" },
      { path: "consulting_Doctor" },
      { path: "wardMasterId" },
      {
        path: "room_id",
        populate: { path: "room_type_id" },
        select: "-bed_id",
      },
      { path: "bed_id", populate: { path: "bed_type_id" } },
      { path: "medicoLegalCaseId" },
    ]);
  } catch (error) {
    throw new Error("Error retrieving shared data by ID: " + error.message);
  }
};

