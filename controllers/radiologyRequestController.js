// controllers/radiologyRequestController.js
import mongoose from 'mongoose';
import Counter from '../models/counter.js';
import RadiologyRequest from '../models/RadiologyRequest.js';
import Service from '../models/Service.js';
import { generateMonthlyMaterialRequestId } from '../utils/generateCustomId.js';

class RadiologyRequestController {
  
    async createRequest(req, res) {
    let session = null;
    
    try {
      // Start MongoDB session for transaction
      session = await mongoose.startSession();
      
      let radiologyRequest;
      
      // Execute within transaction
      await session.withTransaction(async () => {
        
        // Generate request number with counter
        const now = new Date();
        const yy = String(now.getFullYear()).slice(-2);
        
        const counterDoc = await Counter.findOneAndUpdate(
          { module: "RadiologyRequest", year: yy },
          { $inc: { value: 1 } },
          { new: true, upsert: true, session } // Now session is properly defined
        );
        
        const requestNumber = generateMonthlyMaterialRequestId("RadiologyReq", counterDoc.value);
        
        // Extract data from request body
        const {
          patientUhid,
          patientName,
          age,
          gender,
          sourceType,
          opdBillId,
          ipdBillId,
          outpatientCaseId,
          inpatientCaseId,
          bedNumber,
          ward,
          consultingDoctor,
          clinicalHistory,
          clinicalIndication,
          urgency,
          requestTime,
          requestedServices,
          totalAmount,
          createdBy
        } = req.body;

        // Validate required fields
        if (!patientUhid || !patientName || !sourceType || !consultingDoctor || !requestedServices) {
          throw new Error('Missing required fields: patientUhid, patientName, sourceType, consultingDoctor, requestedServices');
        }

        // Handle patientUhid - if it's an object, extract the _id
        let patientUhidId;
        if (typeof patientUhid === 'object' && patientUhid._id) {
          patientUhidId = patientUhid._id;
        } else {
          patientUhidId = patientUhid;
        }

        // Create radiology request data
        const radiologyRequestData = {
          requestNumber, // Use the generated request number
          patientUhid: patientUhidId,
          patientName,
          age: typeof age === 'string' ? age : String(age), // Keep as string for formats like "5Y 8M 5D"
          gender,
          sourceType,
          clinicalHistory: clinicalHistory || 'As per billing request',
          clinicalIndication: clinicalIndication || 'Radiology services requested',
          urgency: urgency || 'routine',
          requestTime: requestTime || new Date().toLocaleTimeString().slice(0, 5),
          consultingDoctor,
          createdBy: createdBy || consultingDoctor,
          requestedServices: requestedServices || []
        };

        // Add source-specific fields
        if (sourceType === 'opd') {
          if (opdBillId) radiologyRequestData.opdBillId = opdBillId;
          if (outpatientCaseId) radiologyRequestData.outpatientCaseId = outpatientCaseId;
        } else if (sourceType === 'ipd') {
          if (ipdBillId) radiologyRequestData.ipdBillId = ipdBillId;
          if (inpatientCaseId) radiologyRequestData.inpatientCaseId = inpatientCaseId;
          if (bedNumber) radiologyRequestData.bedNumber = bedNumber;
          if (ward) radiologyRequestData.ward = ward;
        }

        // Create the radiology request within transaction
        radiologyRequest = new RadiologyRequest(radiologyRequestData);
        await radiologyRequest.save({ session });
        
      });

      console.log(`Radiology request created successfully: ${radiologyRequest.requestNumber}`);

      res.status(201).json({
        success: true,
        message: 'Radiology request created successfully',
        data: {
          _id: radiologyRequest._id,
          requestNumber: radiologyRequest.requestNumber,
          patientName: radiologyRequest.patientName,
          sourceType: radiologyRequest.sourceType,
          overallStatus: radiologyRequest.overallStatus,
          totalAmount: radiologyRequest.totalAmount,
          requestedServices: radiologyRequest.requestedServices
        }
      });

    } catch (error) {
      console.error('Error creating radiology request:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error creating radiology request',
        error: error.message,
        details: error.errors || {}
      });
    } finally {
      // Always end the session
      if (session) {
        await session.endSession();
      }
    }
  }
  // Get all radiology requests with filters
  async getAllRequests(req, res) {
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
      
      if (status) filter.overallStatus = status;
      if (sourceType) filter.sourceType = sourceType;
      if (urgency) filter.urgency = urgency;
      
      if (fromDate || toDate) {
        filter.requestDate = {};
        if (fromDate) filter.requestDate.$gte = new Date(fromDate);
        if (toDate) filter.requestDate.$lte = new Date(toDate);
      }
      
      const skip = (page - 1) * limit;
      
      const requests = await RadiologyRequest.find(filter)
        .populate('patientUhid', 'patientName uhid')
        .populate('consultingDoctor', 'name')
        .populate('assignedTechnician', 'name')
        .populate('assignedRadiologist', 'name')
        .populate('requestedServices.serviceId', 'name')
        .sort({ requestDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await RadiologyRequest.countDocuments(filter);
      
      res.json({
        success: true,
        data: requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching radiology requests',
        error: error.message
      });
    }
  }
  
  // Get single radiology request
  async getRequestById(req, res) {
    try {
      const { id } = req.params;
      
      const request = await RadiologyRequest.findById(id)
        .populate('patientUhid')
        .populate('consultingDoctor', 'name')
        .populate('assignedTechnician', 'name')
        .populate('assignedRadiologist', 'name')
        .populate('opdBillId')
        .populate('ipdBillId')
        .populate('outpatientCaseId')
        .populate('inpatientCaseId')
        .populate('requestedServices.serviceId');
      
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Radiology request not found'
        });
      }
      
      res.json({
        success: true,
        data: request
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching radiology request',
        error: error.message
      });
    }
  }
  
  // Assign technician to request
  async assignTechnician(req, res) {
    try {
      const { id } = req.params;
      const { technicianId } = req.body;
      
      const request = await RadiologyRequest.findByIdAndUpdate(
        id,
        {
          assignedTechnician: technicianId,
          assignedDate: new Date(),
          overallStatus: 'assigned'
        },
        { new: true }
      ).populate('assignedTechnician', 'name');
      
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Radiology request not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Technician assigned successfully',
        data: request
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error assigning technician',
        error: error.message
      });
    }
  }
  
  // Update service status
  async updateServiceStatus(req, res) {
    try {
      const { id, serviceId } = req.params;
      const { status, results, reportUrl } = req.body;
      
      const request = await RadiologyRequest.findById(id);
      
      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Radiology request not found'
        });
      }
      
      const service = request.requestedServices.id(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found in request'
        });
      }
      
      service.status = status;
      if (results) service.results = results;
      if (reportUrl) service.reportUrl = reportUrl;
      if (status === 'completed') service.completedDate = new Date();
      
      // Update overall status
      const allCompleted = request.requestedServices.every(s => s.status === 'completed');
      const anyInProgress = request.requestedServices.some(s => s.status === 'in-progress');
      
      if (allCompleted) {
        request.overallStatus = 'completed';
      } else if (anyInProgress) {
        request.overallStatus = 'in-progress';
      }
      
      await request.save();
      
      res.json({
        success: true,
        message: 'Service status updated successfully',
        data: request
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating service status',
        error: error.message
      });
    }
  }
  
  // Get pending requests for technician dashboard
  async getPendingRequests(req, res) {
    try {
      const requests = await RadiologyRequest.find({
        overallStatus: { $in: ['pending', 'assigned'] }
      })
        .populate('patientUhid', 'patientName uhid')
        .populate('consultingDoctor', 'name')
        .sort({ urgency: -1, requestDate: 1 });
      
      res.json({
        success: true,
        data: requests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching pending requests',
        error: error.message
      });
    }
  }
  
}

export default new RadiologyRequestController();
