import InpatientCase from "../models/InpatientCaseSchema.js";
import Doctor from "../models/doctor.js";
import mongoose from "mongoose";
import { generatePersistentCustomId } from "../utils/generateCustomId.js";
import { lockCaseRates } from "../controllers/caseCompanyController.js";

// Create a new inpatient case
export const createInpatientCase = async (caseData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Generate sequential inpatient case number
    const inpatientCaseNumber = await generatePersistentCustomId("IPD", session);
    caseData.inpatientCaseNumber = inpatientCaseNumber;

    // Step 2: Create the case with session
    const caseDoc = await InpatientCase.create([caseData], { session });

    await session.commitTransaction();
    session.endSession();

    // ✅ Step 3: CRITICAL - Lock company rates after successful case creation
    if (caseDoc[0]) {
      const createdCase = caseDoc[0];
      
      // Check if this is a company patient
      const isCompanyPatient = createdCase.patient_type === 'cashless' || 
                              createdCase.patient_type === 'corporate';
      
      if (isCompanyPatient && createdCase.companyId) {
        try {
          console.log('🔐 Starting company rate locking for IPD case:', createdCase._id);
          
          const lockedRates = await lockCaseRates(
            createdCase._id,
            'IPD',
            createdCase.uniqueHealthIdentificationId,
            createdCase.companyId,
            {
              bed_id: createdCase.bed_id,
              room_id: createdCase.room_id
            }
          );

          if (lockedRates) {
            // Update the case with locked rates reference
            createdCase.lockedRatesId = lockedRates._id;
            await createdCase.save();
            console.log('✅ Company rates locked successfully for IPD case:', createdCase._id);
          }
        } catch (lockError) {
          console.error('❌ Error locking company rates for IPD case:', lockError);
          // Don't fail the case creation, just log the error
        }
      } else {
        console.log('📊 Non-company patient or no company ID - skipping rate locking');
      }
    }

    return caseDoc[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error("Error creating inpatient case: " + error.message);
  }
};

export const getInpatientCase = async (uniqueHealthIdentificationId) => {
  return await InpatientCase.findOne({ uniqueHealthIdentificationId,
    isDischarge: false
   });
};

// export const getInpatientCaseWithBed = async (bed_id) => {
//   if (!mongoose.Types.ObjectId.isValid(bed_id)) {
//     throw new Error("Invalid bed_id");
//   }

//   return await InpatientCase.findOne({
//     bed_id: new mongoose.Types.ObjectId(bed_id),
//     isDischarge: false
//   });

// };

// Get all inpatient cases with pagination and query options
export const getAllInpatientCases = async ({ limit, page, params }) => {
  try {
    const { query } = params;

    // Step 1: Fetch populated records (unfiltered by nested fields)
    const allCases = await InpatientCase.find({}).populate([
      { path: "uniqueHealthIdentificationId" },
      { path: "thirdPartyAdministratorId" },
      { path: "admittingDoctorId" },
      { path: "referringDoctorId" },
      { path: "wardMasterId" },
      {
        path: "room_id",
        populate: { path: "room_type_id" },
        select: "-bed_id",
      },
      { path: "bed_id", populate: { path: "bed_type_id" } },
      { path: "medicoLegalCaseId" },
      { path: "vitals" },
    ]);

    // Step 2: Apply JS-side filtering
    let filtered = allCases;

    if (query.patient_name) {
      const regex = new RegExp(query.patient_name, "i");
      filtered = filtered.filter((doc) =>
        doc.uniqueHealthIdentificationId?.patient_name?.match(regex)
      );
    }

    // You can add more JS-side filters like this:
    if (query.uhid) {
      const regex = new RegExp(query.uhid, "i");
      filtered = filtered.filter((doc) =>
        doc.uniqueHealthIdentificationId?.uhid?.match(regex)
      );
    }

    // Step 3: Pagination on filtered results
    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      limit,
      page,
      inpatientCases: paginated,
    };
  } catch (error) {
    throw new Error("Error retrieving inpatient cases: " + error.message);
  }
};

// Get inpatient case by ID
export const getInpatientCaseById = async (id) => {
  try {
    return await InpatientCase.findById(id).populate([
      { path: "uniqueHealthIdentificationId" },
      { path: "thirdPartyAdministratorId" },
      { path: "admittingDoctorId" },
      { path: "referringDoctorId" },
      { path: "wardMasterId" },
      {
        path: "room_id",
        populate: { path: "room_type_id" },
        select: "-bed_id",
      },
      { path: "bed_id", populate: { path: "bed_type_id" } },
      { path: "medicoLegalCaseId" },
      { path: "vitals" },
      { path: "lockedRatesId" },
    ]);
  } catch (error) {
    throw new Error("Error retrieving inpatient case by ID: " + error.message);
  }
};

// Update an inpatient case record
export const updateInpatientCase = async (id, caseData) => {
  try {
    const updatedCase = await InpatientCase.findByIdAndUpdate(id, caseData, {
      new: true,
    });
    return updatedCase;
  } catch (error) {
    throw new Error("Error updating inpatient case: " + error.message);
  }
};

// Delete an inpatient case record
export const deleteInpatientCase = async (id) => {
  try {
    return await InpatientCase.findByIdAndDelete(id);
  } catch (error) {
    throw new Error("Error deleting inpatient case: " + error.message);
  }
};

export const getInpatientCaseByDoctor = async ({ limit, skip, matchStage }) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "inpatientcases",
          localField: "_id",
          foreignField: "admittingDoctorId",
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
          from: "doctors",
          localField: "inpatientcases.admittingDoctorId",
          foreignField: "_id",
          as: "inpatientcases.admittingDoctorId",
        },
      },
      {
        $lookup: {
          from: "wards",
          localField: "inpatientcases.wardMasterId",
          foreignField: "_id",
          as: "inpatientcases.wardMasterId",
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "inpatientcases.room_id",
          foreignField: "_id",
          as: "inpatientcases.room_id",
        },
      },
      {
        $lookup: {
          from: "roomtypes",
          localField: "inpatientcases.room_id.room_type_id",
          foreignField: "_id",
          as: "inpatientcases.room_id.room_type_id",
        },
      },
      {
        $lookup: {
          from: "beds",
          localField: "inpatientcases.bed_id",
          foreignField: "_id",
          as: "inpatientcases.bed_id",
        },
      },
      {
        $lookup: {
          from: "bedtypes",
          localField: "inpatientcases.bed_id.bed_type_id",
          foreignField: "_id",
          as: "bed_type",
        },
      },
      {
        // Remove documents where `inpatientcases` is an empty array
        $match: {
          inpatientcases: { $ne: [] },
          ...(matchStage || {}),
        },
      },
    ];

    const inpatientCase = await Doctor.aggregate(pipeline);

    return inpatientCase;
  } catch (error) {
    throw new Error(
      "Error retrieving inpatient case by UHID: " + error.message
    );
  }
};
