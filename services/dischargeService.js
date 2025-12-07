import discharge from "../models/InpatientDischargeSchema.js";
import uhid from "../models/uhid.js";
export const createDischarge = async (data) => {
  return await discharge.create(data);
};

export const updateDischarge = async (id, data) => {
  return await discharge.findOneAndUpdate({ id }, data, { new: true });
};

export const getAllDischarges = async ({ page, limit, params }) => {
  const { query = {} } = params || {};

  try {
    const discharges = await discharge
      .find(query)
      .populate({
        path: "uniqueHealthIdentificationId",
        select: "patient_name mobile_number gender age dob dor dot area pincode uhid" 
      })
      .populate({
        path: "inpatientCaseId",
        select: "inpatientCaseNumber admittingDoctorId room_id bed_id wardMasterId patient_type companyName admissionDate admissionTime",
        populate: [
          {
            path: "admittingDoctorId", 
            select: "name email specialization" // Doctor details
          },
          {
            path: "room_id",
            select: "roomNumber roomType"
          },
          {
            path: "bed_id", 
            select: "bed_number bedType"
          },
          {
            path: "wardMasterId",
            select: "wardName"
          }
        ]
      })
      .populate({
        path: "interimBillingId",
        select: "totalAmount paidAmount" // Add billing fields you need
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }); // Most recent discharges first

    const total = await discharge.countDocuments(query);

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      discharges,
    };

  } catch (error) {
    console.error('Error in getAllDischarges:', error);
    throw error;
  }
};

export const getDischargeById = async (id) => {
  return await discharge.findById(id);
};
