import DietChart from "../models/DietChart.js";
import Bed from "../models/Bed.js";
import InpatientCase from "../models/InpatientCaseSchema.js";
import User from "../models/user.js";
import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import Room from "../models/Room.js";
// Get all diet charts with bed and patient info
export const getAllDietCharts = async (req, res) => {
  try {
    const { page = 1, limit = 10, bedId, dietDate } = req.query;
    
    let filter = {};
    if (bedId) filter.bedId = bedId;
    if (dietDate) {
      const startDate = new Date(dietDate);
      const endDate = new Date(dietDate);
      endDate.setDate(endDate.getDate() + 1);
      filter.dietDate = { $gte: startDate, $lt: endDate };
    }

    const dietCharts = await DietChart.find(filter)
      .populate("bedId patientId inpatientCaseId createdBy roomId")
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DietChart.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: dietCharts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching diet charts",
      error: error.message
    });
  }
};

// Get bed-wise diet charts for today
export const getBedWiseDietCharts = async (req, res) => {
  try {
    // ✅ Get all admitted patients
    const admittedPatients = await InpatientCase.find({ 
      isDischarge: false 
    })
    .populate("bed_id admittingDoctorId uniqueHealthIdentificationId room_id")
    .sort({ 'bed_id.bed_number': 1 });

    // ✅ Get ALL diet charts (remove date filter) - get latest for each patient
    const allDietCharts = await DietChart.aggregate([
      {
        $sort: { dietDate: -1, createdAt: -1 }
      },
      {
        $group: {
          _id: '$inpatientCaseId',
          latestDietChart: { $first: '$$ROOT' }
        }
      }
    ]);

    // Populate the aggregated results
    const populatedDietCharts = await DietChart.populate(allDietCharts, [
      { path: 'latestDietChart.bedId', select: 'bed_number' },
      { path: 'latestDietChart.inpatientCaseId', select: 'inpatientCaseNumber' },
      { path: 'latestDietChart.roomId', select: 'roomNumber' },
      { path: 'latestDietChart.patientId', select: 'patient_name uhid' },
      { path: 'latestDietChart.createdBy', select: 'name email role' }
    ]);

    console.log('📊 All diet charts found:', populatedDietCharts.length);
    console.log('📊 Admitted patients found:', admittedPatients.length);

    // ✅ Map diet charts by inpatient case ID for quick lookup
    const dietChartMap = new Map();
    populatedDietCharts.forEach(item => {
      dietChartMap.set(item._id.toString(), item.latestDietChart);
    });

    // ✅ Combine patient info with diet chart data
    const bedWiseData = admittedPatients.map(patient => {
      const patientIdString = patient._id.toString();
      const dietChart = dietChartMap.get(patientIdString);

      console.log(`👤 Patient ${patient.uniqueHealthIdentificationId?.patient_name}: Diet Chart ${dietChart ? 'FOUND' : 'NOT FOUND'}`);

      return {
        patientInfo: {
          id: patient._id,
          uhid: patient.uniqueHealthIdentificationId?.uhid,
          name: patient.uniqueHealthIdentificationId?.patient_name,
          age: patient.uniqueHealthIdentificationId?.age,
          gender: patient.uniqueHealthIdentificationId?.gender,
          mobile: patient.uniqueHealthIdentificationId?.mobile_no,
          admissionDate: patient.admissionDate,
          doctorName: patient.admittingDoctorId?.name,
          patientType: patient.patient_type
        },
        bedInfo: {
          bedId: patient.bed_id?._id,
          bedNumber: patient.bed_id?.bed_number,
          roomNumber: patient.room_id?.roomNumber
        },
        dietChart: dietChart || null,
        hasDietChart: !!dietChart
      };
    });

    res.status(200).json({
      success: true,
      data: bedWiseData,
      total: bedWiseData.length,
      debug: {
        totalAdmittedPatients: admittedPatients.length,
        totalDietChartsFound: populatedDietCharts.length,
        patientsWithDietCharts: bedWiseData.filter(p => p.hasDietChart).length
      }
    });
  } catch (error) {
    console.error('❌ Error in getBedWiseDietCharts:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching bed-wise diet charts",
      error: error.message
    });
  }
};


// controllers/dietChartController.js

// Add this new controller function to your existing file

// controllers/dietChartController.js

export const getDietChartByCaseController = asyncHandler(
  async (req, res) => {
    console.log('🔍 getDietChartByCaseController called');
    console.log('📝 Query params:', req.query);
    
    const { inpatientCaseId } = req.query;

    if (!inpatientCaseId) {
      console.log('❌ No inpatientCaseId provided');
      return res.status(400).json({
        success: false,
        message: "Inpatient case ID is required"
      });
    }

    console.log('🔍 Searching for inpatientCaseId:', inpatientCaseId);

    try {
      // First, let's check if any diet charts exist for this case at all
      const basicQuery = await DietChart.find({ 
        inpatientCaseId: inpatientCaseId 
      });
      
      console.log('📊 Basic query result count:', basicQuery.length);
      console.log('📊 Basic query data:', JSON.stringify(basicQuery, null, 2));

      if (basicQuery.length === 0) {
        console.log('❌ No diet charts found for this inpatient case');
        return res.status(404).json({
          success: false,
          message: "Diet chart not found for this patient",
          data: []
        });
      }

      // Now try with population
      const dietCharts = await DietChart.find({ 
        inpatientCaseId: inpatientCaseId 
      })
      .populate('bedId')
      .populate('roomId')
      .populate('patientId') 
      .populate('inpatientCaseId')
      .populate({
        path: 'createdBy',
        select: 'name email role'
      })
      .sort({ dietDate: -1, createdAt: -1 });

      console.log('📊 Populated query result count:', dietCharts.length);
      console.log('📊 Populated query sample:', dietCharts[0] ? {
        _id: dietCharts[0]._id,
        bedId: dietCharts[0].bedId,
        roomId: dietCharts[0].roomId,
        patientId: dietCharts[0].patientId,
        dietType: dietCharts[0].dietType
      } : 'No data');

      console.log('✅ Sending response with', dietCharts.length, 'diet charts');

      res.status(200).json({
        success: true,
        data: dietCharts,
        total: dietCharts.length,
        debug: {
          inpatientCaseId,
          foundBasic: basicQuery.length,
          foundPopulated: dietCharts.length
        }
      });
      
    } catch (error) {
      console.error('❌ Error in getDietChartByCaseController:', error);
      console.error('❌ Error stack:', error.stack);
      
      // Don't use ErrorHandler, just return direct response for debugging
      return res.status(500).json({
        success: false,
        message: "Failed to fetch diet chart",
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
);


// Create diet chart
export const createDietChart = async (req, res) => {
  try {
    console.log("=== CREATE DIET CHART DEBUG ===");
    console.log("Received request body:", JSON.stringify(req.body, null, 2));
    console.log("Authenticated user:", req.user);
    console.log("User ID from body:", req.body.createdBy);

    // Check if user exists in database
    // const userExists = await User.findById(req.body.createdBy);
    // console.log("User exists in DB:", userExists ? "YES" : "NO");
    
    // if (!userExists) {
    //   console.log("❌ User not found in database with ID:", req.body.createdBy);
    //   return res.status(404).json({
    //     success: false,
    //     message: `User not found with ID: ${req.body.createdBy}`
    //   });
    // }

    // Check if bed exists
    const bedExists = await Bed.findById(req.body.bedId);
    console.log("Bed exists:", bedExists ? "YES" : "NO");
    
    if (!bedExists) {
      return res.status(404).json({
        success: false,
        message: "Bed not found"
      });
    }
    // const roomExists = await Room.findById(req.body.bedId);
    // console.log("Room exists:", roomExists ? "YES" : "NO");
    
    // if (!roomExists) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Room not found"
    //   });
    // }

    // Check if inpatient case exists
    const caseExists = await InpatientCase.findById(req.body.inpatientCaseId);
    console.log("Inpatient case exists:", caseExists ? "YES" : "NO");
    
    if (!caseExists) {
      return res.status(404).json({
        success: false,
        message: "Inpatient case not found"
      });
    }

    // Process the data
    const dietChartData = { ...req.body };

    // Handle empty strings for numeric fields
    if (dietChartData.totalCalories === "") {
      delete dietChartData.totalCalories;
    }

    // Handle restrictions and allergies as arrays
    if (typeof dietChartData.restrictions === 'string') {
      if (dietChartData.restrictions.trim() === '') {
        dietChartData.restrictions = [];
      } else {
        dietChartData.restrictions = dietChartData.restrictions.split(',').map(item => item.trim());
      }
    }

    if (typeof dietChartData.allergies === 'string') {
      if (dietChartData.allergies.trim() === '') {
        dietChartData.allergies = [];
      } else {
        dietChartData.allergies = dietChartData.allergies.split(',').map(item => item.trim());
      }
    }

    console.log("Final diet chart data:", JSON.stringify(dietChartData, null, 2));

    // Create and save diet chart
    const dietChart = new DietChart(dietChartData);
    const savedChart = await dietChart.save();
    console.log("Diet chart saved successfully:", savedChart._id);
    
    // Populate and return
    const populatedChart = await DietChart.findById(savedChart._id)
      .populate('bedId', 'bed_number')
      .populate('patientId', 'patient_name uhid')
      .populate('inpatientCaseId', 'inpatientCaseNumber')
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: "Diet chart created successfully",
      data: populatedChart
    });

  } catch (error) {
    console.error("❌ Error creating diet chart:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      console.log("Validation errors:", validationErrors);
      
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors
      });
    }

    // Handle cast errors (invalid ObjectId)
    if (error.name === 'CastError') {
      console.log("Cast error:", error.path, error.value);
      return res.status(400).json({
        success: false,
        message: `Invalid ${error.path}: ${error.value}`
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry found"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating diet chart",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
// Update diet chart
export const updateDietChart = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedChart = await DietChart.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('bedId')
    .populate('patientId')
    .populate('inpatientCaseId')
    .populate('createdBy', 'name');

    if (!updatedChart) {
      return res.status(404).json({
        success: false,
        message: "Diet chart not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Diet chart updated successfully",
      data: updatedChart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating diet chart",
      error: error.message
    });
  }
};

// Delete diet chart
export const deleteDietChart = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedChart = await DietChart.findByIdAndDelete(id);

    if (!deletedChart) {
      return res.status(404).json({
        success: false,
        message: "Diet chart not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Diet chart deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting diet chart",
      error: error.message
    });
  }
};
