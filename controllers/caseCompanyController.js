// controllers/caseCompanyController.js
import CompanyMaster from '../models/CompanyMaster.js';
import CaseCompanyRates from '../models/CaseCompanyRates.js';
import Service from '../models/Service.js';
import Bed from '../models/Bed.js';
import Room from '../models/Room.js';
import InpatientCase from '../models/InpatientCaseSchema.js';
import OutpatientCase from '../models/OutpatientCaseSchema.js';
import BedType from '../models/BedTypeSchema.js';
import RoomType from '../models/RoomType.js';
import mongoose from 'mongoose';
import { generatePersistentCustomId } from '../utils/generateCustomId.js';

// Lock rates when creating IPD case with company
export const createIPDCaseWithCompany = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      companyId,
      uniqueHealthIdentificationId,
      patient_type,
      bed_id,
      room_id,
      ...otherIPDData
    } = req.body;

    // Validate required fields
    if (!uniqueHealthIdentificationId || !bed_id || !room_id) {
      return res.status(400).json({
        success: false,
        message: 'UHID, bed ID, and room ID are required'
      });
    }

    const inpatientCaseNumber = await generatePersistentCustomId("IPD", session);
    // Create IPD case first
    const ipdCase = new InpatientCase({
      companyId,
      uniqueHealthIdentificationId,
      patient_type,
      bed_id,
      room_id,
      inpatientCaseNumber,
      ...otherIPDData
    });

    await ipdCase.save();

    await session.commitTransaction();
    session.endSession();
    // If company is involved, lock the rates
    if (companyId && (patient_type === 'cashless' || patient_type === 'corporate')) {
      try {
        const lockedRates = await lockCaseRates(
          ipdCase._id,
          'IPD',
          uniqueHealthIdentificationId,
          companyId,
          { bed_id, room_id }
        );
        
        // Update IPD case with locked rates reference
        ipdCase.lockedRatesId = lockedRates._id;
        await ipdCase.save();
      } catch (lockError) {
        console.error('Error locking rates for IPD case:', lockError);
        // Don't fail the case creation, just log the error
      }
    }

    res.status(201).json({
      success: true,
      message: 'IPD case created successfully with company rates locked',
      data: ipdCase
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating IPD case with company:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Lock rates when creating OPD case with company
export const createOPDCaseWithCompany = async (req, res) => {
  try {
    const {
      companyId,
      uniqueHealthIdentificationId,
      patient_type,
      ...otherOPDData
    } = req.body;

    // Validate required fields
    if (!uniqueHealthIdentificationId) {
      return res.status(400).json({
        success: false,
        message: 'UHID is required'
      });
    }

    // Create OPD case first
    const opdCase = new OutpatientCase({
      companyId,
      uniqueHealthIdentificationId,
      patient_type,
      ...otherOPDData
    });

    await opdCase.save();

    // If company is involved, lock the rates
    if (companyId && patient_type === 'cashless') {
      try {
        const lockedRates = await lockCaseRates(
          opdCase._id,
          'OPD',
          uniqueHealthIdentificationId,
          companyId
        );
        
        // Update OPD case with locked rates reference
        opdCase.lockedRatesId = lockedRates._id;
        await opdCase.save();
      } catch (lockError) {
        console.error('Error locking rates for OPD case:', lockError);
        // Don't fail the case creation, just log the error
      }
    }

    res.status(201).json({
      success: true,
      message: 'OPD case created successfully with company rates locked',
      data: opdCase
    });
  } catch (error) {
    console.error('Error creating OPD case with company:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to lock rates
// In controllers/caseCompanyController.js - Fix the lockCaseRates function

// Helper function to lock rates
// controllers/caseCompanyController.js - FIXED lockCaseRates function

// MongoDB command to fix the current case
// controllers/caseCompanyController.js - Fix lockCaseRates function

export const lockCaseRates = async (caseId, caseType, uhidId, companyId, additionalData = {}) => {
  try {
    // Check if rates are already locked for this case
    const existingLock = await CaseCompanyRates.findOne({ caseId });
    if (existingLock) {
      console.log('✅ Rates already locked for case:', caseId);
      return existingLock;
    }

    console.log(`🔐 Locking rates for case: ${caseId}, company: ${companyId}`);

    const company = await CompanyMaster.findById(companyId)
      .populate('serviceRates.serviceId')
      .populate('bedTypeRates.bedTypeId')
      .populate('roomTypeRates.roomTypeId');
    
    if (!company) {
      throw new Error('Company not found');
    }

    // Get all services, bed types, and room types
    const [allServices, allBedTypes, allRoomTypes] = await Promise.all([
      Service.find({}),
      BedType.find({}),
      RoomType.find({})
    ]);

    console.log(`🔧 Total services found: ${allServices.length}`);
    console.log(`🔧 Total bedTypes found: ${allBedTypes.length}`);
    console.log(`🔧 Total roomTypes found: ${allRoomTypes.length}`);

    // ✅ FIXED: Create locked service rates
    const lockedServiceRates = allServices.map(service => {
      const companyRate = company.serviceRates.find(
        rate => rate.serviceId._id.toString() === service._id.toString()
      );
      
      // ✅ FIX: Use correct variable name
      const lockedRate = companyRate ? companyRate.customRate : service.charge;
      
      return {
        serviceId: service._id,
        serviceName: service.name,
        lockedRate: lockedRate,
        originalRate: service.charge,
        serviceType: service.type
      };
    });

    // Create locked bed type rates
    const lockedBedTypeRates = allBedTypes.map(bedType => {
      const companyRate = company.bedTypeRates.find(
        rate => rate.bedTypeId._id.toString() === bedType._id.toString()
      );
      return {
        bedTypeId: bedType._id,
        bedTypeName: bedType.name,
        lockedRate: companyRate ? companyRate.customRate : bedType.price_per_day,
        originalRate: bedType.price_per_day
      };
    });

    // Create locked room type rates
    const lockedRoomTypeRates = allRoomTypes.map(roomType => {
      const companyRate = company.roomTypeRates.find(
        rate => rate.roomTypeId._id.toString() === roomType._id.toString()
      );
      return {
        roomTypeId: roomType._id,
        roomTypeName: roomType.name,
        lockedRate: companyRate ? companyRate.customRate : roomType.price_per_day,
        originalRate: roomType.price_per_day
      };
    });

    // ✅ FIXED: Handle specific bed and room rates for IPD
    let assignedBedRate = {};
    let assignedRoomRate = {};
    
    if (caseType === 'IPD' && additionalData.bed_id && additionalData.room_id) {
      const [bed, room] = await Promise.all([
        Bed.findById(additionalData.bed_id).populate('bed_type_id'),
        Room.findById(additionalData.room_id).populate('room_type_id')
      ]);
      
      if (bed && bed.bed_type_id) {
        const bedTypeCompanyRate = company.bedTypeRates.find(
          rate => rate.bedTypeId.toString() === bed.bed_type_id._id.toString()
        );
        assignedBedRate = {
          bedId: bed._id,
          lockedRate: bedTypeCompanyRate ? bedTypeCompanyRate.customRate : bed.bed_type_id.price_per_day
        };
        console.log(`🛏️ Assigned bed rate: ₹${assignedBedRate.lockedRate}`);
      }
      
      if (room && room.room_type_id) {
        const roomTypeCompanyRate = company.roomTypeRates.find(
          rate => rate.roomTypeId.toString() === room.room_type_id._id.toString()
        );
        
        // ✅ CRITICAL FIX: Use correct variable name
        const correctRoomRate = roomTypeCompanyRate ? roomTypeCompanyRate.customRate : room.room_type_id.price_per_day;
        
        assignedRoomRate = {
          roomId: room._id,
          lockedRate: correctRoomRate
        };
        
        console.log(`🏠 Room type: ${room.room_type_id.name}`);
        console.log(`🏠 Original room rate: ₹${room.room_type_id.price_per_day}`);
        console.log(`🏠 Company room rate: ₹${roomTypeCompanyRate?.customRate || 'N/A'}`);
        console.log(`🏠 Assigned room rate: ₹${assignedRoomRate.lockedRate}`);
      }
    }

    // Save locked rates
    const caseCompanyRates = new CaseCompanyRates({
      caseId,
      caseType,
      uhidId,
      companyId,
      companyName: company.companyName,
      lockedServiceRates,
      lockedBedTypeRates,
      lockedRoomTypeRates,
      assignedBedRate,
      assignedRoomRate
    });

    await caseCompanyRates.save();
    console.log(`💾 Rates locked successfully for case: ${caseId}`);
    
    return caseCompanyRates;
  } catch (error) {
    console.error('❌ Error locking case rates:', error);
    throw error;
  }
};



// Get case locked rates for billing
export const getCaseLockedRates = async (req, res) => {
  try {
    const { caseId, caseType } = req.params;
    
    if (!caseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid case ID format'
      });
    }
    
    const lockedRates = await CaseCompanyRates.findOne({ 
      caseId, 
      caseType: caseType.toUpperCase() 
    })
      .populate('companyId')
      .populate('uhidId')
      .populate('lockedServiceRates.serviceId')
      .populate('lockedBedTypeRates.bedTypeId')
      .populate('lockedRoomTypeRates.roomTypeId');
    
    if (!lockedRates) {
      return res.status(404).json({
        success: false,
        message: 'No locked rates found for this case'
      });
    }
    
    res.status(200).json({
      success: true,
      data: lockedRates
    });
  } catch (error) {
    console.error('Error fetching case locked rates:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get service rate for specific case (for billing)
// controllers/caseCompanyController.js - Fix the getCaseServiceRate function

// Get service rate for specific case (for billing)
export const getCaseServiceRate = async (req, res) => {
  try {
    const { caseId, caseType, serviceId } = req.params;
    
    console.log(`🔍 Getting service rate for case: ${caseId}, service: ${serviceId}`);
    
    if (!caseId.match(/^[0-9a-fA-F]{24}$/) || !serviceId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid case ID or service ID format'
      });
    }
    
    const lockedRates = await CaseCompanyRates.findOne({ 
      caseId, 
      caseType: caseType.toUpperCase() 
    });
    
    console.log(`🔒 Locked rates found:`, !!lockedRates);
    
    if (!lockedRates) {
      // If no locked rates, use standard service rate
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }
      
      console.log(`📊 Using standard rate for ${service.name}: ${service.charge}`);
      
      return res.status(200).json({
        success: true,
        data: {
          serviceId,
          serviceName: service.name,
          rate: service.charge,
          isLocked: false
        }
      });
    }
    
    // Find the service in locked rates - FIXED COMPARISON
    const serviceRate = lockedRates.lockedServiceRates.find(
      rate => {
        const rateServiceId = rate.serviceId.toString();
        const targetServiceId = serviceId.toString();
        console.log(`🔍 Comparing: ${rateServiceId} === ${targetServiceId}`);
        return rateServiceId === targetServiceId;
      }
    );
    
    console.log(`🎯 Service rate found in locked rates:`, !!serviceRate);
    
    if (!serviceRate) {
      // If service not in locked rates, use standard rate
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }
      
      console.log(`📊 Service not in locked rates, using standard rate: ${service.charge}`);
      
      return res.status(200).json({
        success: true,
        data: {
          serviceId,
          serviceName: service.name,
          rate: service.charge,
          isLocked: false
        }
      });
    }
    
    console.log(`💰 Using locked company rate: ${serviceRate.lockedRate}`);
    
    res.status(200).json({
      success: true,
      data: {
        serviceId,
        serviceName: serviceRate.serviceName,
        rate: serviceRate.lockedRate,
        originalRate: serviceRate.originalRate,
        isLocked: true,
        companyName: lockedRates.companyName,
        savings: serviceRate.originalRate - serviceRate.lockedRate
      }
    });
  } catch (error) {
    console.error('❌ Error fetching case service rate:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get bed rate for specific IPD case (for billing)
export const getCaseBedRate = async (req, res) => {
  try {
    const { caseId } = req.params;
    
    if (!caseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid case ID format'
      });
    }
    
    const lockedRates = await CaseCompanyRates.findOne({ 
      caseId, 
      caseType: 'IPD'
    });
    
    if (!lockedRates || !lockedRates.assignedBedRate.bedId) {
      // If no locked rates, get from IPD case and use standard bed rate
      const ipdCase = await InpatientCase.findById(caseId)
        .populate({
          path: 'bed_id',
          populate: { path: 'bed_type_id' }
        });
      
      if (!ipdCase) {
        return res.status(404).json({
          success: false,
          message: 'IPD case not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          bedId: ipdCase.bed_id._id,
          bedNumber: ipdCase.bed_id.bed_number,
          bedType: ipdCase.bed_id.bed_type_id.name,
          rate: ipdCase.bed_id.bed_type_id.price_per_day,
          isLocked: false
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        bedId: lockedRates.assignedBedRate.bedId,
        rate: lockedRates.assignedBedRate.lockedRate,
        isLocked: true,
        companyName: lockedRates.companyName
      }
    });
  } catch (error) {
    console.error('Error fetching case bed rate:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get room rate for specific IPD case (for billing)
export const getCaseRoomRate = async (req, res) => {
  try {
    const { caseId } = req.params;
    
    if (!caseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid case ID format'
      });
    }
    
    const lockedRates = await CaseCompanyRates.findOne({ 
      caseId, 
      caseType: 'IPD'
    });
    
    if (!lockedRates || !lockedRates.assignedRoomRate.roomId) {
      // If no locked rates, get from IPD case and use standard room rate
      const ipdCase = await InpatientCase.findById(caseId)
        .populate({
          path: 'room_id',
          populate: { path: 'room_type_id' }
        });
      
      if (!ipdCase) {
        return res.status(404).json({
          success: false,
          message: 'IPD case not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          roomId: ipdCase.room_id._id,
          roomNumber: ipdCase.room_id.roomNumber,
          roomType: ipdCase.room_id.room_type_id.name,
          rate: ipdCase.room_id.room_type_id.price_per_day,
          isLocked: false
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        roomId: lockedRates.assignedRoomRate.roomId,
        rate: lockedRates.assignedRoomRate.lockedRate,
        isLocked: true,
        companyName: lockedRates.companyName
      }
    });
  } catch (error) {
    console.error('Error fetching case room rate:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
