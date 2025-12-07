
// controllers/companyMasterController.js
import CompanyMaster from '../models/CompanyMaster.js';
import Service from '../models/Service.js';
import BedType from '../models/BedTypeSchema.js';
import RoomType from '../models/RoomType.js';
import CaseCompanyRates from '../models/CaseCompanyRates.js';

// Create company master
export const createCompanyMaster = async (req, res) => {
  try {
    console.log('Creating company master with data:', req.body);
    
    const companyMaster = new CompanyMaster(req.body);
    await companyMaster.save();
    
    // Populate the created company
    await companyMaster.populate([
      { path: 'serviceRates.serviceId', select: 'name charge type' },
      { path: 'bedTypeRates.bedTypeId', select: 'name price_per_day' },
      { path: 'roomTypeRates.roomTypeId', select: 'name price_per_day' }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Company master created successfully',
      data: companyMaster
    });
  } catch (error) {
    console.error('Error creating company master:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Company with this name already exists'
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : []
    });
  }
};

// Get all company masters
export const getAllCompanyMasters = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      type = '', 
      isActive 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { companyShortName: { $regex: search, $options: 'i' } },
        { tpaName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const companies = await CompanyMaster.find(filter)
      .populate('serviceRates.serviceId', 'name charge type')
      .populate('bedTypeRates.bedTypeId', 'name price_per_day')
      .populate('roomTypeRates.roomTypeId', 'name price_per_day')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalCount = await CompanyMaster.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: companies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: skip + companies.length < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get company by ID
export const getCompanyById = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    if (!companyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID format'
      });
    }
    
    const company = await CompanyMaster.findById(companyId)
      .populate('serviceRates.serviceId', 'name charge type')
      .populate('bedTypeRates.bedTypeId', 'name price_per_day')
      .populate('roomTypeRates.roomTypeId', 'name price_per_day');
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update company master
export const updateCompanyMaster = async (req, res) => {
  try {
    const { companyId } = req.params;
    const updateData = req.body;
    
    if (!companyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID format'
      });
    }
    
    const company = await CompanyMaster.findByIdAndUpdate(
      companyId,
      updateData,
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    )
    .populate('serviceRates.serviceId', 'name charge type')
    .populate('bedTypeRates.bedTypeId', 'name price_per_day')
    .populate('roomTypeRates.roomTypeId', 'name price_per_day');
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: company
    });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update company rates specifically
export const updateCompanyRates = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { serviceRates, bedTypeRates, roomTypeRates, ...otherFields } = req.body;
    
    if (!companyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID format'
      });
    }
    
    const company = await CompanyMaster.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Update basic company information
    Object.keys(otherFields).forEach(key => {
      if (otherFields[key] !== undefined && otherFields[key] !== null) {
        company[key] = otherFields[key];
      }
    });

    // Update rates if provided
    if (serviceRates && Array.isArray(serviceRates)) {
      company.serviceRates = serviceRates
        .filter(rate => rate.serviceId && rate.customRate !== undefined && rate.customRate !== null)
        .map(rate => ({
          serviceId: rate.serviceId,
          customRate: parseFloat(rate.customRate),
          effectiveDate: rate.effectiveDate || new Date()
        }));
    }
    
    if (bedTypeRates && Array.isArray(bedTypeRates)) {
      company.bedTypeRates = bedTypeRates
        .filter(rate => rate.bedTypeId && rate.customRate !== undefined && rate.customRate !== null)
        .map(rate => ({
          bedTypeId: rate.bedTypeId,
          customRate: parseFloat(rate.customRate),
          effectiveDate: rate.effectiveDate || new Date()
        }));
    }
    
    if (roomTypeRates && Array.isArray(roomTypeRates)) {
      company.roomTypeRates = roomTypeRates
        .filter(rate => rate.roomTypeId && rate.customRate !== undefined && rate.customRate !== null)
        .map(rate => ({
          roomTypeId: rate.roomTypeId,
          customRate: parseFloat(rate.customRate),
          effectiveDate: rate.effectiveDate || new Date()
        }));
    }

    await company.save();
    
    // Populate and return updated company
    await company.populate([
      { path: 'serviceRates.serviceId', select: 'name charge type' },
      { path: 'bedTypeRates.bedTypeId', select: 'name price_per_day' },
      { path: 'roomTypeRates.roomTypeId', select: 'name price_per_day' }
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Company rates updated successfully',
      data: company
    });
  } catch (error) {
    console.error('Error updating company rates:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete company
export const deleteCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    if (!companyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID format'
      });
    }
    
    // Check if company is used in any cases
    const casesUsingCompany = await CaseCompanyRates.countDocuments({ companyId });
    
    if (casesUsingCompany > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete company. It is being used in ${casesUsingCompany} case(s).`,
        casesCount: casesUsingCompany
      });
    }
    
    const company = await CompanyMaster.findByIdAndDelete(companyId);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Company deleted successfully',
      data: { 
        deletedCompany: {
          id: company._id,
          name: company.companyName,
          shortName: company.companyShortName
        }
      }
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get patient locked rates (for backward compatibility with UHID)
export const getPatientLockedRates = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (!patientId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID format'
      });
    }
    
    const lockedRates = await CaseCompanyRates.find({ uhidId: patientId })
      .populate('companyId', 'companyName companyShortName type')
      .populate('lockedServiceRates.serviceId', 'name type')
      .populate('lockedBedTypeRates.bedTypeId', 'name')
      .populate('lockedRoomTypeRates.roomTypeId', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: lockedRates,
      count: lockedRates.length
    });
  } catch (error) {
    console.error('Error fetching patient locked rates:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get active companies for dropdown
export const getActiveCompanies = async (req, res) => {
  try {
    const companies = await CompanyMaster.find({ isActive: true })
      .select('companyName companyShortName type tpaName')
      .sort({ companyName: 1 });
    
    res.status(200).json({
      success: true,
      data: companies,
      count: companies.length
    });
  } catch (error) {
    console.error('Error fetching active companies:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get company rates for a specific company
export const getCompanyRates = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    if (!companyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID format'
      });
    }
    
    const company = await CompanyMaster.findById(companyId)
      .populate('serviceRates.serviceId', 'name charge type')
      .populate('bedTypeRates.bedTypeId', 'name price_per_day')
      .populate('roomTypeRates.roomTypeId', 'name price_per_day');
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        companyInfo: {
          _id: company._id,
          companyName: company.companyName,
          companyShortName: company.companyShortName,
          type: company.type,
          isActive: company.isActive
        },
        serviceRates: company.serviceRates,
        bedTypeRates: company.bedTypeRates,
        roomTypeRates: company.roomTypeRates,
        totalServiceRates: company.serviceRates.length,
        totalBedTypeRates: company.bedTypeRates.length,
        totalRoomTypeRates: company.roomTypeRates.length
      }
    });
  } catch (error) {
    console.error('Error fetching company rates:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle company active status
export const toggleCompanyStatus = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    if (!companyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID format'
      });
    }
    
    const company = await CompanyMaster.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    company.isActive = !company.isActive;
    await company.save();
    
    res.status(200).json({
      success: true,
      message: `Company ${company.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: company._id,
        companyName: company.companyName,
        isActive: company.isActive
      }
    });
  } catch (error) {
    console.error('Error toggling company status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get companies by type
export const getCompaniesByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['Cashless', 'Credit', 'Corporate', 'Cash'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company type. Must be one of: Cashless, Credit, Corporate, Cash'
      });
    }
    
    const companies = await CompanyMaster.find({ 
      type, 
      isActive: true 
    })
    .select('companyName companyShortName tpaName')
    .sort({ companyName: 1 });
    
    res.status(200).json({
      success: true,
      data: companies,
      count: companies.length,
      type
    });
  } catch (error) {
    console.error('Error fetching companies by type:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all services, bed types, and room types for rate setup
export const getAllRateEntities = async (req, res) => {
  try {
    const [services, bedTypes, roomTypes] = await Promise.all([
      Service.find({ isActive: true }).select('name charge type').sort({ name: 1 }),
      BedType.find({ is_active: true }).select('name price_per_day').sort({ name: 1 }),
      RoomType.find({ isActive: true }).select('name price_per_day').sort({ name: 1 })
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        services,
        bedTypes,
        roomTypes
      },
      counts: {
        services: services.length,
        bedTypes: bedTypes.length,
        roomTypes: roomTypes.length
      }
    });
  } catch (error) {
    console.error('Error fetching rate entities:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
 