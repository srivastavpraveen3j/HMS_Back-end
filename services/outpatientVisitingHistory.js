// import OutpatientVisitingHistory from "../models/outpatientVisitingHistory.js";
import OutpatientCase from "../models/outpatientVisitingHistory.js";
import UHID from "../models/uhid.js";
// Service to create a new OutpatientVisitingHistory
// export const createOutpatientVisitingHistory = async (data) => {
//   try {
//     return await OutpatientCase.create(data);
//   } catch (error) {
//     throw new Error("Error creating outpatient visiting history: " + error.message);
//   }
// };

export const getAllOutpatientVisitingHistory = async ({
  limit,
  page,
  matchStage,
}) => {
  try {
    const history = await UHID.aggregate([
      // Lookup to join outpatient cases
      {
        $lookup: {
          from: "outpatientcases",
          localField: "_id",
          foreignField: "uniqueHealthIdentificationId",
          as: "outpatientcases",
          pipeline: [
            // lookup doctor from User collection
            {
              $lookup: {
                from: "users",
                localField: "consulting_Doctor",
                foreignField: "_id",
                as: "consulting_Doctor",
              },
            },
            {
              $unwind: {
                path: "$consulting_Doctor",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "referringDoctorId",
                foreignField: "_id",
                as: "referringDoctor",
              },
            },
            {
              $unwind: {
                path: "$referringDoctor",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
        },
      },
      // Lookup to join outpatient bills
      {
        // $lookup: {
        //   from: "outpatientbills",
        //   localField: "_id",
        //   foreignField: "patientUhid",
        //   as: "OutpatientBills"
        // }
        $lookup: {
          from: "outpatientbills",
          let: { patientId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$patientUhid", "$$patientId"] },
              },
            },
            {
              $lookup: {
                from: "discountmetas",
                localField: "DiscountMeta",
                foreignField: "_id",
                as: "discountMeta",
              },
            },
            {
              $unwind: {
                path: "$discountMeta",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "OutpatientBills",
        },
      },
      // Lookup to join outpatient deposits based on outpatient bills
      {
        $lookup: {
          from: "outpatientdeposits",
          let: { outpatientBillIds: "$OutpatientBills._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$outpatientBillId", "$$outpatientBillIds"],
                },
              },
            },
            {
              $lookup: {
                from: "services",
                localField: "serviceId",
                foreignField: "_id",
                as: "serviceId",
              },
            },
            {
              $lookup: {
                from: "deposits",
                localField: "depositId",
                foreignField: "_id",
                as: "depositId",
              },
            },
          ],
          as: "OutpatientDeposits",
        },
      },
      // Match stage that applies the dynamic filters from middleware
      { $match: matchStage || {} },

      // Pagination: skip based on page number and limit
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    const total = await OutpatientCase.countDocuments();
    const pagination = {
      total: total,
      page,
      limit,
    };

    return { pagination, history };
  } catch (error) {
    throw new Error(
      "Error fetching outpatient visiting history: " + error.message
    );
  }
};

// Service to update OutpatientVisitingHistory
// export const updateOutpatientVisitingHistory = async (id, data) => {
//   try {
//     const history = await OutpatientCase.findByIdAndUpdate(id, data, { new: true });
//     if (!history) throw new Error("Outpatient Visiting History not found");
//     return history;
//   } catch (error) {
//     throw new Error("Error updating outpatient visiting history: " + error.message);
//   }
// };

// Service to delete OutpatientVisitingHistory
// export const deleteOutpatientVisitingHistory = async (id) => {
//   try {
//     const history = await OutpatientCase.findByIdAndDelete(id);
//     if (!history) throw new Error("Outpatient Visiting History not found");
//     return { message: "Outpatient Visiting History deleted successfully" };
//   } catch (error) {
//     throw new Error("Error deleting outpatient visiting history: " + error.message);
//   }
// };
