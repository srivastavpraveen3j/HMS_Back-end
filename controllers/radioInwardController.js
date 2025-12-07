// controllers/radioInwardController.js
import RadioInward, { FindingTemplate } from '../models/RadioInward.js';
import RadiologyRequest from '../models/RadiologyRequest.js';
import multer from 'multer';
import path from 'path';
import UserSignature from '../models/UserSignature.js';

// Configure multer for signature uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/signatures/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'signature-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

class RadioInwardController {
  
  // Get all radio inward records
  async getAllRecords(req, res) {
    try {
      const {
        status,
        sourceType,
        urgency,
        fromDate,
        toDate,
        page = 1,
        limit = 20
      } = req.query;
      
      const filter = {};
      
      if (status) filter.reportStatus = status;
      if (sourceType) filter.sourceType = sourceType;
      if (urgency) filter.urgency = urgency;
      
      if (fromDate || toDate) {
        filter.studyDate = {};
        if (fromDate) filter.studyDate.$gte = new Date(fromDate);
        if (toDate) filter.studyDate.$lte = new Date(toDate);
      }
      
      const skip = (page - 1) * limit;
      
      const records = await RadioInward.find(filter)
        .populate('patientUhid', 'patientName uhid')
        .populate('consultantRadiologist', 'name')
        .populate('reportedBy', 'name')
        .populate('referredBy', 'name')
        .populate('requestedServices.serviceId', 'name')
        .sort({ studyDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await RadioInward.countDocuments(filter);
      
      res.json({
        success: true,
        data: records,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching radio inward records',
        error: error.message
      });
    }
  }
  
  // Create new radio inward record
  async createRecord(req, res) {
    try {
      const recordData = req.body;
      
      // Validate radiology request exists
      const radiologyRequest = await RadiologyRequest.findById(recordData.radiologyRequestId);
      if (!radiologyRequest) {
        return res.status(404).json({
          success: false,
          message: 'Radiology request not found'
        });
      }
      
      // Create radio inward record
      const radioInward = new RadioInward(recordData);
      await radioInward.save();
      
      // Update original radiology request status
      await RadiologyRequest.findByIdAndUpdate(
        recordData.radiologyRequestId,
        { overallStatus: 'in-progress' }
      );
      
      // Populate the created record
      await radioInward.populate([
        { path: 'patientUhid', select: 'patientName uhid' },
        { path: 'consultantRadiologist', select: 'name' },
        { path: 'reportedBy', select: 'name' }
      ]);
      
      res.status(201).json({
        success: true,
        message: 'Radio inward record created successfully',
        data: radioInward
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error creating radio inward record',
        error: error.message
      });
    }
  }
  
  // Get record by ID
  async getRecordById(req, res) {
    try {
      const { id } = req.params;
      
      const record = await RadioInward.findById(id)
        .populate('patientUhid')
        .populate('consultantRadiologist', 'name')
        .populate('reportedBy', 'name')
        .populate('referredBy', 'name')
        .populate('radiologyRequestId')
        .populate('requestedServices.serviceId')
        .populate('templateUsed');
      
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Radio inward record not found'
        });
      }
      
      res.json({
        success: true,
        data: record
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching radio inward record',
        error: error.message
      });
    }
  }
  
  // Update record
  async updateRecord(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const record = await RadioInward.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate([
        { path: 'patientUhid', select: 'patientName uhid' },
        { path: 'consultantRadiologist', select: 'name' },
        { path: 'reportedBy', select: 'name' }
      ]);
      
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Radio inward record not found'
        });
      }
      
      // Update radiology request status if report is finalized
      if (updateData.reportStatus === 'final') {
        await RadiologyRequest.findByIdAndUpdate(
          record.radiologyRequestId,
          { 
            overallStatus: 'completed',
            'requestedServices.$[].status': 'completed'
          }
        );
        
        record.completedAt = new Date();
        await record.save();
      }
      
      res.json({
        success: true,
        message: 'Radio inward record updated successfully',
        data: record
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating radio inward record',
        error: error.message
      });
    }
  }
  
  // Upload signature
  // Enhanced uploadSignature method in radioInwardController.js
async uploadSignature(req, res) {
  try {
    const { id } = req.params;
    const { signatureData, signatureType = 'draw' } = req.body;
    
    let signaturePayload = {
      signatureType,
      createdAt: new Date()
    };
    
    if (req.file) {
      // File upload
      signaturePayload.signatureData = `/uploads/signatures/${req.file.filename}`;
      signaturePayload.fileName = req.file.filename;
      signaturePayload.signatureType = 'upload';
    } else if (signatureData) {
      // Base64 data (from canvas or uploaded file converted to base64)
      signaturePayload.signatureData = signatureData;
      signaturePayload.signatureType = signatureType || 'draw';
    } else {
      return res.status(400).json({
        success: false,
        message: 'No signature data provided'
      });
    }
    
    const record = await RadioInward.findByIdAndUpdate(
      id,
      { radiologistSignature: signaturePayload },
      { new: true }
    );
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Radio inward record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Signature uploaded successfully',
      data: {
        signature: record.radiologistSignature
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading signature',
      error: error.message
    });
  }
}


// In radioInwardController.js

// Get user signatures
// In radioInwardController.js

// ✅ Enhanced getUserSignatures method
// ✅ Fixed getUserSignatures method without populate
async getUserSignatures(req, res) {
  try {
    const { userId } = req.params;
    
    console.log('🔍 Getting signatures for userId:', userId);
    
    // Load ALL signatures for now (for testing)
    const filter = { 
      isActive: true 
    };
    
    // ✅ Remove .populate() since createdBy field doesn't exist in schema
    const signatures = await UserSignature.find(filter)
      .sort({ createdAt: -1 });
    
    console.log('✅ Found signatures:', signatures.length);
    console.log('✅ Signatures data:', signatures);
    
    res.json({
      success: true,
      data: signatures
    });
  } catch (error) {
    console.error('❌ Error fetching signatures:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching signatures',
      error: error.message
    });
  }
}


// Save user signature
async saveUserSignature(req, res) {
  try {
    const signatureData = req.body;
    
    const signature = new UserSignature(signatureData);
    await signature.save();
    
    res.status(201).json({
      success: true,
      message: 'Signature saved successfully',
      data: signature
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error saving signature',
      error: error.message
    });
  }
}

// Delete user signature
async deleteUserSignature(req, res) {
  try {
    const { id } = req.params;
    
    await UserSignature.findByIdAndUpdate(id, { isActive: false });
    
    res.json({
      success: true,
      message: 'Signature deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting signature',
      error: error.message
    });
  }
}


  
  // TEMPLATE MANAGEMENT
  
  // Create finding template
  async createTemplate(req, res) {
    try {
      const template = new FindingTemplate(req.body);
      await template.save();
      
      res.status(201).json({
        success: true,
        message: 'Finding template created successfully',
        data: template
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error creating template',
        error: error.message
      });
    }
  }
  
  // Get templates by service name
  async getTemplatesByService(req, res) {
    try {
      const { serviceName } = req.query;
      
      const filter = { isActive: true };
      if (serviceName) {
        filter.serviceName = new RegExp(serviceName, 'i');
      }
      
      const templates = await FindingTemplate.find(filter)
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });
      
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching templates',
        error: error.message
      });
    }
  }
  
  // Update template
  async updateTemplate(req, res) {
    try {
      const { id } = req.params;
      
      const template = await FindingTemplate.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Template updated successfully',
        data: template
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating template',
        error: error.message
      });
    }
  }
  
  // Delete template
  async deleteTemplate(req, res) {
    try {
      const { id } = req.params;
      
      const template = await FindingTemplate.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Template deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting template',
        error: error.message
      });
    }
  }
  
  // Search similar reports for template suggestions
  async searchSimilarReports(req, res) {
    try {
      const { serviceName, patientAge, gender } = req.query;
      
      const filter = {
        reportStatus: 'final',
        'requestedServices.serviceName': new RegExp(serviceName, 'i')
      };
      
      // Add age and gender filters if provided
      if (patientAge) {
        // Simple age range matching (±5 years)
        const age = parseInt(patientAge);
        filter.$or = [
          { age: { $gte: age - 5, $lte: age + 5 } },
          { age: new RegExp(`${age}`, 'i') }
        ];
      }
      
      if (gender) {
        filter.gender = gender;
      }
      
      const similarReports = await RadioInward.find(filter)
        .select('protocol observation impression serviceName age gender')
        .limit(10)
        .sort({ createdAt: -1 });
      
      res.json({
        success: true,
        data: similarReports
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error searching similar reports',
        error: error.message
      });
    }
  }
}

export default new RadioInwardController();
export { upload };
