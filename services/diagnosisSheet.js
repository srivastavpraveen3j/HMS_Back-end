import DiagnosisSheet from "../models/diagnosisSheet.js";
import UHID from "../models/uhid.js";

export const createDiagnosis = async (data) => {
  return await DiagnosisSheet.create(data);
};

export const getAllDiagnosis = async ({ page, limit, matchStage }) => {
  const diagnosis = await UHID.aggregate([
    {
      $match: matchStage,
    },
    {
      $lookup: {
        from: "diagnosissheets",
        localField: "_id",
        foreignField: "uniqueHealthIdentificationId",
        as: "diagnosis",
      },
    },
    {
      $unwind: {
        path: "$diagnosis",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "inpatientcases",
        localField: "_id",
        foreignField: "uniqueHealthIdentificationId",
        as: "inpatientcases",
      },
    },
    {
      $unwind: {
        path: "$inpatientcases",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "inpatientcases.admittingDoctorId",
        foreignField: "_id",
        as: "inpatientcases.admittingDoctorId",
      },
    },

    // ✅ OutpatientCase Lookup
    {
      $lookup: {
        from: "outpatientcases",
        localField: "_id",
        foreignField: "uniqueHealthIdentificationId",
        as: "outpatientcases",
      },
    },
    {
      $unwind: {
        path: "$outpatientcases",
        preserveNullAndEmptyArrays: true,
      },
    },

    // ✅ Populate Consulting Doctor (User collection)
    {
      $lookup: {
        from: "users",
        localField: "outpatientcases.consulting_Doctor",
        foreignField: "_id",
        as: "outpatientcases.consulting_Doctor",
      },
    },

    // ✅ Populate Referring Doctor (User collection)
    {
      $lookup: {
        from: "users",
        localField: "outpatientcases.referringDoctorId",
        foreignField: "_id",
        as: "outpatientcases.referringDoctorId",
      },
    },

    // ✅ Populate MedicoLegalCase
    {
      $lookup: {
        from: "medicolegalcases",
        localField: "outpatientcases.medicoLegalCaseId",
        foreignField: "_id",
        as: "outpatientcases.medicoLegalCaseId",
      },
    },

    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);

  const total = await UHID.countDocuments(matchStage);
  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
    diagnosis,
  };
};

export const getDiagnosisById = async (id) => {
  return await DiagnosisSheet.findById(id)
    .populate("outpatientCaseId uniqueHealthIdentificationId inpatientCaseId")
    .populate({
      path: "inpatientCaseId",
      populate: {
        path: "bed_id",
      },
    });
};

export const updateDiagnosis = async (id, data) => {
  return await DiagnosisSheet.findOneAndUpdate({ _id: id }, data, {
    new: true,
  });
};

export const deleteDiagnosis = async (id) => {
  return await DiagnosisSheet.findOneAndDelete({ id });
};

export const getDiagnosisSheetByCase = async ({
  outpatientCaseId,
  inpatientCaseId,
}) => {
  const filter = {};

  if (outpatientCaseId) {
    filter.outpatientCaseId = outpatientCaseId;
  }

  if (inpatientCaseId) {
    filter.inpatientCaseId = inpatientCaseId;
  }

  return await DiagnosisSheet.find(filter)
    .populate("uniqueHealthIdentificationId", "uhid patient_name")
    .populate({
      path: "outpatientCaseId",
      populate: [
        { path: "consulting_Doctor", select: "name" },
        { path: "referringDoctorId", select: "name" }, // added referring doctor
      ],
    })
    .populate("inpatientCaseId createdBy")
    .lean();
};
