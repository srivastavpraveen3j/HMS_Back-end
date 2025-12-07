import outpatientBill from "../models/outpatientBillSchema.js";
import { generateBillId } from "../utils/generatBillId.js";
import mongoose from "mongoose";
export const createOutpatientBill = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let billNumber;
    let existingBill;
    let attempts = 0;

    do {
      if (attempts >= 10) {
        throw new Error(
          "Unable to generate a unique bill number after 10 attempts."
        );
      }

      billNumber = await generateBillId("OutpatientBill", session);
      existingBill = await outpatientBill
        .findOne({ billnumber: billNumber })
        .session(session);

      attempts++;
    } while (existingBill);

    data.billnumber = billNumber;

    const bill = await outpatientBill.create([data], { session });

    await session.commitTransaction();
    session.endSession();

    return bill[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(error.message || "Failed to create outpatient bill");
  }
};

export const getAllOutpatientBills = async ({ limit, page, params }) => {
  try {
    const { query } = params;
    const data = await outpatientBill
      .find(query)
      .populate("patientUhid depositId DiscountMeta Consulting_Doctor appointmentId")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await outpatientBill.countDocuments();

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      data,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getOutpatientBillById = async (id) => {
  try {
    return await outpatientBill
      .findById(id)
      .populate("patientUhid depositId DiscountMeta Consulting_Doctor appointmentId")
      .populate({
        path: "OutpatientcaseId",
        populate: [
          { path: "consulting_Doctor" },
          { path: "referringDoctorId" },
        ],
      });
  } catch (error) {
    throw new Error(error);
  }
};


export const deleteOutpatientBill = async (id) => {
  try {
    return await outpatientBill.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(error);
  }
};

export const updateOutpatientBill = async (id, data) => {
  try {
    return await outpatientBill.findByIdAndUpdate(id, data, { new: true });
  } catch (error) {
    throw new Error(error);
  }
};

export const getOutpatientBillByPatientIdService = async ({ outpatientId }) => {
  const filter = {};

  if (outpatientId) {
    filter.patientUhid = outpatientId;
  }

  return await outpatientBill.find(filter)
    .populate("OutpatientcaseId DiscountMeta")

};

export const getOutpatientBillByCase = async ({ outpatientCaseId, inpatientCaseId }) => {
  const filter = {};

  if (outpatientCaseId) {
    filter.OutpatientcaseId = outpatientCaseId;
  }

  if (inpatientCaseId) {
    filter.inpatientCaseId = inpatientCaseId;
  }

  return await outpatientBill.find(filter)
    .populate("OutpatientcaseId DiscountMeta")

};
