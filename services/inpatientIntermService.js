import InpatientCase from "../models/InpatientCaseSchema.js";
import inpatientIntermBill from "../models/InpatientItermBill.js";
import InpatientIntermBillHistory from "../models/InpatientItermBillHistory.js";
import UHID from "../models/uhid.js";
import { ObjectId } from "mongodb";

export const createInpatientIntermBill = async (data) => {
  try {
    return await InpatientIntermBillHistory.create(data);
  } catch (error) {
    throw new Error("Error creating inpatient interm bill: " + error.message);
  }
};

export const getInpatientIntermBillHistory = async (name) => {
  try {
    const regex = new RegExp(name, "i");
    return await InpatientIntermBillHistory.find({
      patientName: { $regex: regex },
    });
  } catch (error) {
    throw new Error(
      "Error retrieving inpatient interm bill by UHID: " + error.message
    );
  }
};

export const getInpatientIntermBillById = async (id) => {
  try {
    return await inpatientIntermBill.findById(id);
  } catch (error) {
    throw new Error(
      "Error retrieving inpatient interm bill by ID: " + error.message
    );
  }
};

export const getInpatientIntermBillHistoryByCaseId = async ({
  inpatientCaseId,
}) => {
  try {
    return await InpatientIntermBillHistory.find({
      inpatientCaseId,
    });
  } catch (error) {
    throw new Error(
      "Error retrieving inpatient interm bill by Case ID: " + error.message
    );
  }
};

// export const getAllInpatientIntermBills = async ({ limit, page, matchStage }) => {
//     try {
//         const pipelines = [
//             {
//                 $lookup: {
//                     from: "inpatientcases",
//                     let: { patientId: "$_id" },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$uniqueHealthIdentificationId", "$$patientId"] },
//                                         { $ne: ["$isDischarge", true] }
//                                     ]
//                                 }
//                             }
//                         },
//                         {
//                             $lookup: {
//                                 from: "users",
//                                 localField: "admittingDoctorId",
//                                 foreignField: "_id",
//                                 as: "admittingDoctor"
//                             }
//                         },
//                         { $unwind: { path: "$admittingDoctor", preserveNullAndEmptyArrays: true } },

//                         {
//                             $lookup: {
//                                 from: "wards",
//                                 localField: "wardMasterId",
//                                 foreignField: "_id",
//                                 as: "wardMaster"
//                             }
//                         },
//                         { $unwind: { path: "$wardMaster", preserveNullAndEmptyArrays: true } },

//                         {
//                             $lookup: {
//                                 from: "rooms",
//                                 localField: "room_id",
//                                 foreignField: "_id",
//                                 as: "room"
//                             }
//                         },
//                         { $unwind: { path: "$room", preserveNullAndEmptyArrays: true } },

//                         {
//                             $lookup: {
//                                 from: "roomtypes",
//                                 localField: "room.room_type_id",
//                                 foreignField: "_id",
//                                 as: "roomType"
//                             }
//                         },
//                         { $unwind: { path: "$roomType", preserveNullAndEmptyArrays: true } },

//                         {
//                             $lookup: {
//                                 from: "beds",
//                                 localField: "bed_id",
//                                 foreignField: "_id",
//                                 as: "bed"
//                             }
//                         },
//                         { $unwind: { path: "$bed", preserveNullAndEmptyArrays: true } },

//                         {
//                             $lookup: {
//                                 from: "bedtypes",
//                                 localField: "bed.bed_type_id",
//                                 foreignField: "_id",
//                                 as: "bedType"
//                             }
//                         },
//                         { $unwind: { path: "$bedType", preserveNullAndEmptyArrays: true } },
//                         {
//                             $lookup: {
//                                 from: "inwards",
//                                 let: { patientId: "$uniqueHealthIdentificationId" },
//                                 pipeline: [
//                                     {
//                                         $match: {
//                                             $expr: {
//                                                 $eq: ["$uniqueHealthIdentificationId", "$$patientId"]
//                                             }
//                                         }
//                                     }
//                                 ],
//                                 as: "inwards"
//                             }
//                         },
//                         { $unwind: { path: "$inwards", preserveNullAndEmptyArrays: true } },
//                         {
//                             $lookup: {
//                                 from: "inpatientdeposits",
//                                 let: { patientId: "$uniqueHealthIdentificationId" },
//                                 pipeline: [
//                                     {
//                                         $match: {
//                                             $expr: {
//                                                 $eq: ["$uniqueHealthIdentificationId", "$$patientId"]
//                                             }
//                                         }
//                                     }
//                                 ],
//                                 as: "inpatientDeposits"
//                             }
//                         },
//                         {
//                             $project: {
//                                 admissionDate: 1,
//                                 admissionTime: 1,
//                                 isDischarge: 1,
//                                 createdAt: 1,
//                                 admittingDoctor: 1,
//                                 wardMaster: 1,
//                                 inwards: 1,
//                                 inpatientDeposits: 1,
//                                 room: {
//                                     $mergeObjects: ["$room", { roomType: "$roomType" }]
//                                 },
//                                 bed: {
//                                     $mergeObjects: ["$bed", { bedType: "$bedType" }]
//                                 }
//                             }
//                         }
//                     ],
//                     as: "inpatientCase"
//                 }
//             },

//             // Filter records with at least one case
//             { $match: { inpatientCase: { $ne: [] } } },

//             {
//                 $lookup: {
//                     from: "inpatientbillings",
//                     let: { patientId: "$_id" },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $eq: ["$uniqueHealthIdentificationId", "$$patientId"]
//                                 }
//                             }
//                         },
//                         {
//                             $lookup: {
//                                 from: "services",
//                                 localField: "serviceId",
//                                 foreignField: "_id",
//                                 as: "service"
//                             }
//                         }
//                     ],
//                     as: "inpatientBills"
//                 }
//             },

//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "_id",
//                     foreignField: "inpatientBilling.consultingDoctorId",
//                     as: "consultingDoctor"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "pharmaceuticalinwards",
//                     localField: "_id",
//                     foreignField: "uniqueHealthIdentificationId",
//                     as: "pharmaceuticalInward"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "operationtheatresheets",
//                     let: { patientId: "$_id" },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $eq: ["$uniqueHealthIdentificationId", "$$patientId"]
//                                 }
//                             }
//                         },
//                         // {
//                         //     $lookup: {
//                         //         from: "surgeryservices",
//                         //         localField: "surgeryPackageId",
//                         //         foreignField: "_id",
//                         //         as: "surgeryPackage"
//                         //     }
//                         // }
//                     ],
//                     as: "operationtheatresheet"
//                 }
//             },
//             { $unwind: { path: "$inpatientCase", preserveNullAndEmptyArrays: true } },
//             { $match: matchStage },
//             {
//                 $project: {
//                     _id: 1,
//                     patient_name: 1,
//                     gender: 1,
//                     dob: 1,
//                     age: 1,
//                     dor: 1,
//                     dot: 1,
//                     mobile_no: 1,
//                     area: 1,
//                     pincode: 1,
//                     uhid: 1,
//                     inpatientBilling: 1,
//                     consultingDoctor: 1,
//                     inpatientCase: 1,
//                     inpatientBills: 1,
//                     pharmaceuticalInward: 1,
//                     operationtheatresheet: 1
//                 }
//             },
//             { $sort: { "inpatientCase.createdAt": -1 } },
//             { $skip: (page - 1) * limit },
//             { $limit: limit }
//         ];
//         const intermBill = await UHID.aggregate(pipelines);
//         const total = await intermBill.length;

//         return { total, totalPages: Math.ceil(total / limit), limit, page, intermBill };
//     } catch (error) {
//         throw new Error("Error retrieving all inpatient interm bills: " + error.message);
//     }
// }

export const getAllInpatientIntermBills = async ({
  limit = 10,
  page = 1,
  inpatientCaseId,
}) => {
  try {
    if (!inpatientCaseId) {
      throw new Error("inpatientCaseId is required");
    }

    const caseObjectId = new ObjectId(inpatientCaseId);

    limit = Number(limit);
    page = Number(page);

    const skip = (page - 1) * limit;

    const pipeline = [
      // 1️⃣ Match inpatient case
      { $match: { _id: caseObjectId } },

      // 2️⃣ Patient Lookup
      {
        $lookup: {
          from: "uhids",
          localField: "uniqueHealthIdentificationId",
          foreignField: "_id",
          as: "patient",
        },
      },
      { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "rooms",
          localField: "room_id",
          foreignField: "_id",
          as: "room",
        },
      },
      {
        $unwind: { path: "$room", preserveNullAndEmptyArrays: true },
      },

      // 4️⃣ Room Type Lookup
      {
        $lookup: {
          from: "roomtypes",
          localField: "room.room_type_id",
          foreignField: "_id",
          as: "roomType",
        },
      },
      {
        $unwind: { path: "$roomType", preserveNullAndEmptyArrays: true },
      },

      // 5️⃣ Bed Lookup
      {
        $lookup: {
          from: "beds",
          localField: "bed_id",
          foreignField: "_id",
          as: "bed",
        },
      },
      {
        $unwind: { path: "$bed", preserveNullAndEmptyArrays: true },
      },

      // 6️⃣ Bed type Lookup
      {
        $lookup: {
          from: "bedtypes",
          localField: "bed.bed_type_id",
          foreignField: "_id",
          as: "bedType",
        },
      },
      {
        $unwind: { path: "$bedType", preserveNullAndEmptyArrays: true },
      },

      // 7️⃣ Admitting doctor
      {
        $lookup: {
          from: "users",
          localField: "admittingDoctorId",
          foreignField: "_id",
          as: "admittingDoctor",
        },
      },
      {
        $unwind: { path: "$admittingDoctor", preserveNullAndEmptyArrays: true },
      },

      // 8️⃣ Inwards
      {
        $lookup: {
          from: "inwards",
          let: { caseId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$inpatientCaseId", "$$caseId"] } } },
          ],
          as: "inwards",
        },
      },

      // 9️⃣ Deposits
      {
        $lookup: {
          from: "inpatientdeposits",
          let: { caseId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$inpatientCaseId", "$$caseId"] } } },
          ],
          as: "inpatientDeposits",
        },
      },

      // 🔟 Billing
      {
        $lookup: {
          from: "inpatientbillings",
          let: { caseId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$inpatientCaseId", "$$caseId"] } } },
          ],
          as: "inpatientBills",
        },
      },

      // 1️⃣1️⃣ Services
      {
        $lookup: {
          from: "services",
          localField: "inpatientBills.serviceId",
          foreignField: "_id",
          as: "services",
        },
      },

      // 1️⃣2️⃣ Pharmacy Inward
      {
        $lookup: {
          from: "pharmaceuticalinwards",
          let: { uhid: "$uniqueHealthIdentificationId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$uniqueHealthIdentificationId", "$$uhid"] },
              },
            },
          ],
          as: "pharmaceuticalInward",
        },
      },

      // 1️⃣3️⃣ OT Sheets
      {
        $lookup: {
          from: "operationtheatresheets",
          let: { caseId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$inpatientCaseId", "$$caseId"] } } },
          ],
          as: "operationtheatresheet",
        },
      },

      // 1️⃣4️⃣ Pagination
      { $skip: skip },
      { $limit: limit },
    ];

    const data = await InpatientCase.aggregate(pipeline);

    return {
      total: data.length,
      page,
      limit,
      data,
    };
  } catch (error) {
    throw new Error("Error fetching inpatient interm bills: " + error.message);
  }
};

export const updateInpatientIntermBill = async (id, data) => {
  try {
    return await inpatientIntermBill.findByIdAndUpdate(id, data, { new: true });
  } catch (error) {
    throw new Error("Error updating inpatient interm bill: " + error.message);
  }
};

export const deleteInpatientIntermBill = async (id) => {
  try {
    return await inpatientIntermBill.findByIdAndDelete(id);
  } catch (error) {
    throw new Error("Error deleting inpatient interm bill: " + error.message);
  }
};
