import Fuse from "fuse.js";

import OutpatientCase from '../models/OutpatientCaseSchema.js';
// import Doctor from '../models/doctor.js';
import User from "../models/user.js";
import { findUHIDbyID } from './uhid.js';
import UHID from '../models/uhid.js';
// Create a new Outpatient Case
export const createOutpatientCase = async (data) => {
  try {
    return await OutpatientCase.create(data);
  } catch (error) {
    throw new Error('Error creating outpatient case: ' + error.message);
  }
};

export const getOutpatientCase = async (uniqueHealthIdentificationId) => {
  return await OutpatientCase.findOne({ uniqueHealthIdentificationId });
}

// Get all Outpatient Cases with pagination
export const getAllOutpatientCases = async ({ limit, page, params }) => {
  try {
    const { query } = params;
    const outpatientCases = await OutpatientCase.find(query).populate('uniqueHealthIdentificationId consulting_Doctor referringDoctorId')
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await OutpatientCase.countDocuments(query);
    return {
      total,
      page,
      totalPages: Math.ceil(await OutpatientCase.countDocuments(query) / limit),
      limit,
      outpatientCases,
    };
  } catch (error) {
    throw new Error('Error fetching outpatient cases: ' + error.message);
  }
};

// Get a single Outpatient Case by ID
export const getOutpatientCaseById = async (id) => {
  try {
    const outpatientCase = await OutpatientCase.findById(id).populate('uniqueHealthIdentificationId consulting_Doctor referringDoctorId');
    if (!outpatientCase) {
      throw new Error('Outpatient Case not found');
    }
    return outpatientCase;
  } catch (error) {
    throw new Error('Error fetching outpatient case: ' + error.message);
  }
};

// Update an Outpatient Case by ID
export const updateOutpatientCase = async (id, data) => {
  try {
    const outpatientCase = await OutpatientCase.findByIdAndUpdate(id, data, { new: true });
    if (!outpatientCase) {
      throw new Error('Outpatient Case not found');
    }
    return outpatientCase;
  } catch (error) {
    throw new Error('Error updating outpatient case: ' + error.message);
  }
};

// Delete an Outpatient Case by ID
export const deleteOutpatientCase = async (id) => {
  try {
    const outpatientCase = await OutpatientCase.findByIdAndDelete(id);
    if (!outpatientCase) {
      throw new Error('Outpatient Case not found');
    }
    return outpatientCase;
  } catch (error) {
    throw new Error('Error deleting outpatient case: ' + error.message);
  }
};


export const getOutpatientCasesByDoctorId = async ({ limit, skip, matchStage }) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "outpatientcases",
          localField: "_id",
          foreignField: "consulting_Doctor",
          as: "outpatientcases"
        },
      },
      {
        // Remove documents where `outpatientcases` is an empty array
        $match: {
          outpatientcases: { $ne: [] },
          ...(matchStage || {})
        }
      }
    ]

    const outpatientCase = await User.aggregate(pipeline);
    return outpatientCase

  } catch (error) {
    throw new Error('Error fetching outpatient cases: ' + error.message);
  }
}


export const searchOutpatientCases = async (searchText) => {
  if (!searchText || searchText.trim() === "") {
    throw new Error("Search text is required");
  }

  const clean = searchText.trim().toLowerCase();

  const allUHID = await UHID.find({}, "patient_name uhid mobile_no");


  const fuse = new Fuse(allUHID, {
    keys: ["patient_name", "uhid", "mobile_no"],
    threshold: 0.2,              // lower = stricter (0.3–0.45 works best)
    distance: 100,               // word proximity
    minMatchCharLength: 2,
    ignoreLocation: true,
  });

  const fuzzyResults = fuse.search(clean);

  if (!fuzzyResults.length) {
    return { uhidMatches: [], opdCases: [] };
  }

  const uhidDocs = fuzzyResults.map(r => r.item);

  const uhidIds = uhidDocs.map(u => u._id);

  const opdCases = await OutpatientCase.find({
    uniqueHealthIdentificationId: { $in: uhidIds }
  }).populate("uniqueHealthIdentificationId");

  return opdCases
};
