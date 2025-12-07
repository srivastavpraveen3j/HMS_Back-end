// services/visitMaster.js
import visitMasterSchema from "../models/VisitMaster.js";
import VisitTypeMaster from "../models/VisitTypeMaster.js";
import InpatientCase from "../models/InpatientCaseSchema.js";
export const createVisitMaster = async (data) => {
  return await visitMasterSchema.create(data);
};

export const getVisitMasterById = async (id) => {
  return await visitMasterSchema.findById(id).populate([
    { path: 'doctorId', select: 'name email' },
    { path: 'InpatientCase', select: 'inpatientCaseNumber room_id bed_id' },
    { path: 'visitTypeMasterId', select: 'headName visitType' },
    { path: 'createdBy', select: 'name email' },
    { path: 'selectedServices.serviceId', select: 'name charge' },
    { path: 'manualDoctorId', select: 'name specialization experience reg_no' },

  ]);
};

// service
export const getVisitMasterByInpatientCase = async (
  inpatientCaseId
) => {
  return await visitMasterSchema
    .find({ inpatientCaseId, isActive: true })
    .populate([
      { path: 'doctorId'},
      {
        path: 'manualDoctorId',
        select: 'name specialization experience reg_no',
      },
      { path: 'visitTypeMasterId', select: 'headName visitType' },
      { path: 'createdBy', select: 'name email' },
    ])
    .sort({ createdAt: -1 });
};


export const updateVisitMaster = async (id, updateData) => {
  return await visitMasterSchema.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteVisitMaster = async (id) => {
  return await visitMasterSchema.findByIdAndDelete(id);
};

export const getAllVisitMasters = async (queryOptions) => {
  const { page, limit, query } = queryOptions;
  
  const visitMasters = await visitMasterSchema
    .find({ ...query, isActive: true })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate([
      { path: 'doctorId', select: 'name' },
      { path: 'InpatientCase', select: 'inpatientCaseNumber' },
      { path: 'visitTypeMasterId', select: 'headName' },
    { path: 'manualDoctorId', select: 'name specialization experience reg_no' },

    ])
    .lean();
    
  const total = await visitMasterSchema.countDocuments({ ...query, isActive: true });
  
  return { 
    total, 
    page, 
    totalPages: Math.ceil(total / limit), 
    limit, 
    visitMasters 
  };
};

// Calculate amount based on VisitTypeMaster rates
export const calculateVisitAmount = async (visitData) => {
  const { doctorId, InpatientCase, visitTypeMasterId, selectedServices, noOfVisits = 1 } = visitData;
  
  const inpatientCase = await InpatientCase.findById(InpatientCase).populate('room_id bed_id');
  const visitTypeMaster = await VisitTypeMaster.findById(visitTypeMasterId);
  
  if (!inpatientCase || !visitTypeMaster) {
    throw new Error('Invalid inpatient case or visit type master');
  }
  
  let totalAmount = 0;
  
  if (visitTypeMaster.visitType === 'visit') {
    const rate = visitTypeMaster.doctorRates.find(rate => 
      rate.doctorId.toString() === doctorId.toString() &&
      rate.roomTypeId.toString() === inpatientCase.room_id.roomTypeId?.toString() &&
      rate.bedTypeId.toString() === inpatientCase.bed_id.bedTypeId?.toString()
    );
    totalAmount = ((rate?.roomRate || 0) + (rate?.bedRate || 0)) * noOfVisits;
    
  } else if (visitTypeMaster.visitType === 'procedure') {
    for (const service of selectedServices || []) {
      const serviceRate = visitTypeMaster.procedureServices.find(ps => 
        ps.doctorId.toString() === doctorId.toString() &&
        ps.roomTypeId.toString() === inpatientCase.room_id.roomTypeId?.toString() &&
        ps.bedTypeId.toString() === inpatientCase.bed_id.bedTypeId?.toString() &&
        ps.serviceId.toString() === service.serviceId.toString()
      );
      totalAmount += (serviceRate?.serviceAmount || 0) * (service.quantity || 1);
    }
    totalAmount *= noOfVisits;
  }
  
  return totalAmount;
};
