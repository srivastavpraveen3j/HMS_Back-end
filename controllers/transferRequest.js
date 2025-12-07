// controllers/transferRequest.js
import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import { 
  createTransferRequest, 
  approveTransferRequest, 
  getTransferRequests,
  getSubPharmacies,
  checkMedicineAvailability,
  completeTransferRequest,
  debugTransferStatus
} from "../services/transferRequest.js";

export const createTransferRequestController = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.user?._id || 'system';
  
  const userInfo = {
    name: req.user?.name || "Current User",
    email: req.user?.email || "N/A"
  };
  
  try {
    const transferRequest = await createTransferRequest(req.body, userId, userInfo);

    res.status(201).json({
      success: true,
      message: "Transfer request created successfully",
      data: {
        request_id: transferRequest.request_id,
        status: transferRequest.status,
        total_estimated_cost: transferRequest.total_estimated_cost,
        medicines_count: transferRequest.requested_medicines.length
      }
    });
  } catch (error) {
    throw new ErrorHandler(error.message || 'Failed to create transfer request', 500);
  }
});

export const approveTransferRequestController = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const approvedBy = req.user?.id || req.user?._id || 'manager';
  
  const userInfo = {
    name: req.user?.name || 'Manager',
    email: req.user?.email || 'N/A'
  };
  
  try {
    const approvedRequest = await approveTransferRequest(requestId, approvedBy, req.body, userInfo);
    
    res.status(200).json({
      success: true,
      message: `Transfer request ${req.body.status} successfully`,
      data: {
        request_id: approvedRequest.request_id,
        status: approvedRequest.status,
        total_approved_cost: approvedRequest.total_approved_cost,
        pharmacy_name: approvedRequest.to_pharmacy?.pharmacy_name,
        pharmacy_id: approvedRequest.to_pharmacy?.pharmacy_id,
        next_action: req.body.status === 'approved' ? 'complete_transfer' : null
      }
    });
  } catch (error) {
    throw new ErrorHandler(error.message || 'Failed to process request', 500);
  }
});

// ✅ FIXED: Complete transfer controller with better logging
export const completeTransferController = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const completedBy = req.user?.id || req.user?._id || 'manager';
  
  const userInfo = {
    name: req.user?.name || 'Manager',
    email: req.user?.email || 'N/A'
  };
  
  try {
    console.log(`🎯 COMPLETE TRANSFER REQUEST: ${requestId}`);
    console.log(`👤 Completed by: ${userInfo.name} (${userInfo.email})`);
    
    const completedRequest = await completeTransferRequest(requestId, completedBy, userInfo);
    
    // ✅ Get debug info to verify transfer
    const debugInfo = await debugTransferStatus(requestId);
    
    res.status(200).json({
      success: true,
      message: "Inventory transfer completed successfully! Stock has been moved.",
      data: {
        request_id: completedRequest.request_id,
        status: completedRequest.status,
        total_transferred_cost: completedRequest.total_approved_cost,
        pharmacy_name: completedRequest.to_pharmacy?.pharmacy_name,
        completed_at: completedRequest.completed_at,
        medicines_transferred: completedRequest.requested_medicines.filter(m => m.approved_quantity > 0).length,
        debug_info: debugInfo // ✅ Include debug info in response
      }
    });
  } catch (error) {
    console.error(`❌ COMPLETE TRANSFER FAILED: ${error.message}`);
    throw new ErrorHandler(error.message || 'Failed to complete transfer', 500);
  }
});

// ✅ NEW: Debug endpoint
export const debugTransferController = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  
  try {
    const debugInfo = await debugTransferStatus(requestId);
    
    res.json({
      success: true,
      data: debugInfo
    });
  } catch (error) {
    throw new ErrorHandler(error.message || 'Debug failed', 500);
  }
});

export const getTransferRequestsController = asyncHandler(async (req, res) => {
  const { status, priority, pharmacy_id, page = 1, limit = 10 } = req.query;
  
  const result = await getTransferRequests(
    { status, priority, pharmacy_id },
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result.requests,
    pagination: result.pagination
  });
});

export const getSubPharmaciesController = asyncHandler(async (req, res) => {
  const pharmacies = await getSubPharmacies();

  res.status(200).json({
    success: true,
    data: pharmacies,
    count: pharmacies.length
  });
});

export const checkMedicineAvailabilityController = asyncHandler(async (req, res) => {
  const { medicine_ids } = req.body;
  
  if (!medicine_ids || !Array.isArray(medicine_ids)) {
    return res.status(400).json({
      success: false,
      message: 'Medicine IDs array is required'
    });
  }

  const availability = await checkMedicineAvailability(medicine_ids);

  res.json({
    success: true,
    data: availability
  });
});
