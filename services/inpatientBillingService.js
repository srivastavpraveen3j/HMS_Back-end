import InpatientBilling from "../models/InpatientBillingSchema.js";
import UHID from "../models/uhid.js";
import { generateCustomId } from "../utils/generateCustomId.js";
import Counter from "../models/counter.js";
import mongoose from "mongoose";
export const createInpatientBilling = async (billingData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);

    const counterDoc = await Counter.findOneAndUpdate(
      { module: "InpatientBilling", year: yy }, // query
      { $inc: { value: 1 } }, // update
      { new: true, upsert: true, session } // options
    );

    const billNumber = generateCustomId("I", counterDoc.value);
    billingData.billNumber = billNumber;

    const [createdBill] = await InpatientBilling.create([billingData], {
      session,
    });

    await session.commitTransaction();
    session.endSession();

    return createdBill;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error("Error creating inpatient billing: " + error.message);
  }
};

// Get all inpatient billing records with pagination and query options
export const getAllInpatientBillings = async ({ limit, page, matchStage }) => {
  try {
    // const { query } = params;
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $lookup: {
          from: "inpatientbillings",
          localField: "_id",
          foreignField: "uniqueHealthIdentificationId",
          as: "inpatientbillings",
        },
      },
      {
        // Remove documents where `inpatientbillings` is an empty array
        $match: {
          inpatientbillings: { $ne: [] },
          ...(matchStage || {}),
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];

    const newPipeline = [
      {
        $lookup: {
          from: "inpatientbillings",
          localField: "_id",
          foreignField: "uniqueHealthIdentificationId",
          as: "inpatientbillings",
        },
      },
      {
        $match: {
          inpatientbillings: { $ne: [] },
          ...(matchStage || {}),
        },
      },
      {
        $unwind: "$inpatientbillings",
      },
      // {
      //   $lookup: {
      //     from: "services",
      //     localField: "inpatientbillings.serviceId",
      //     foreignField: "_id",
      //     as: "inpatientbillings.serviceDetails",
      //   },
      // },
      {
        $group: {
          _id: "$_id",

          // Preserve all original patient fields
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
          __v: { $first: "$__v" },

          inpatientbillings: { $push: "$inpatientbillings" },
        },
      },
      { $skip: skip },
      { $limit: limit },
    ];

    const billings = await UHID.aggregate(pipeline);
    const newBillings = await UHID.aggregate(newPipeline);
    const total = await billings.length;

    return {
      total,
      totalPages: Math.ceil(total / limit),
      limit,
      page,
      billings,
      newBillings,
    };
  } catch (error) {
    throw new Error("Error retrieving inpatient billings: " + error.message);
  }
};

// Get inpatient billing by ID
export const getInpatientBillingById = async (id) => {
  try {
    return await InpatientBilling.findById(id);
  } catch (error) {
    throw new Error(
      "Error retrieving inpatient billing by ID: " + error.message
    );
  }
};

export const getInpatientBillByCase = async ({ inpatientCaseId }) => {
  const filter = { inpatientCaseId };
  return await InpatientBilling.find(filter).populate("inpatientCaseId serviceId").lean();
};

// Update an inpatient billing record
export const updateInpatientBilling = async (id, billingData) => {
  try {
    const updatedBilling = await InpatientBilling.findByIdAndUpdate(
      id,
      billingData,
      { new: true }
    );
    return updatedBilling;
  } catch (error) {
    throw new Error("Error updating inpatient billing: " + error.message);
  }
};

// Delete an inpatient billing record
export const deleteInpatientBilling = async (id) => {
  try {
    return await InpatientBilling.findByIdAndDelete(id);
  } catch (error) {
    throw new Error("Error deleting inpatient billing: " + error.message);
  }
};
