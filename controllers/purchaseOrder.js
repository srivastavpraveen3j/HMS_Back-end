import { createPurchaseOrder, getAllPurchaseOrders, getPurchaseOrderById, updatePurchaseOrder, deletePurchaseOrder, getReplacementPOsByVendorService, createReplacementPO } from "../services/purchaseOrder.js";
import { sendEmail } from "../utils/sendMail.js";
import PurchaseOrder from "../models/purchaseOrder.js";
import asyncHandler from "../utils/asyncWrapper.js";
import { emailTemp } from "../constants/templates.js";
import DisposedMedicine from "../models/disposedMedicine.js";
import Vendor from "../models/vendor.js";
import mongoose from "mongoose";
import { generatePurchaseOrderPDF } from "../constants/pdfGenerator.js";
import emailService from "../services/emailService.js";

export const createPurchaseOrderController = asyncHandler(async (req, res) => {
  const poData = req.body;

  if (!poData.deliveryDate) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    poData.deliveryDate = futureDate;
  }

  const createdPO = await createPurchaseOrder(poData);

  await createdPO.populate([
    { path: 'vendor.id', select: 'name email phone' },
    { path: 'rfq.id', select: 'rfqNumber' },
    { path: 'createdBy', select: 'name email' },
  ]);

  if (!createdPO) {
    throw new Error('❌ Failed to create Purchase Order');
  }

  const vendorEmail = createdPO.vendor.email;
  let emailResult = { status: 'skipped', email: vendorEmail };

  if (vendorEmail) {
    try {
      console.log('📧 Sending PO email with PDF to:', vendorEmail);
      
      // ✅ Generate PDF
      const pdfBuffer = await generatePurchaseOrderPDF(createdPO.toObject());
      
      // ✅ Send email with PDF using your existing email service
      const emailResponse = await emailService.sendPurchaseOrderEmail(
        vendorEmail, 
        createdPO.toObject(), 
        pdfBuffer
      );
      
      emailResult = {
        status: 'sent',
        email: vendorEmail,
        messageId: emailResponse.messageId,
        attachmentSize: `${(pdfBuffer.length / 1024).toFixed(2)} KB`
      };
      
      console.log('✅ PO email with PDF sent successfully');
      
    } catch (err) {
      console.error('❌ Email sending failed:', err);
      emailResult = {
        status: 'failed',
        email: vendorEmail,
        error: err.message
      };
    }
  }

  res.status(201).json({
    success: true,
    message: '✅ Purchase Order created and email sent successfully',
    data: createdPO,
    emailResult,
  });
});

export const getAllPurchaseorderController = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate,
      // ✅ NEW: Search parameters
      poNumber,
      vendorName
    } = req.query;

    const result = await getAllPurchaseOrders({
      limit: Number(limit),
      page: Number(page),
      params: { 
        query: {}, 
        startDate, 
        endDate,
        // ✅ NEW: Pass search parameters
        poNumber,
        vendorName
      },
    });

    res.json({
      success: true,
      message: 'Purchase orders retrieved successfully',
      ...result
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve purchase orders',
      error: err.message 
    });
  }
};



export const getByIdPurchaseorderController = async (req, res) => {
  try {
    const data = await getPurchaseOrderById(req.params.id);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Purchase Order retrieved successfully',
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve purchase order',
      error: error.message
    });
  }
};

export const updatePurchaseorderController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const updatedPO = await updatePurchaseOrder(id, updateData);

  if (!updatedPO) {
    return res.status(404).json({
      success: false,
      message: "Purchase Order not found"
    });
  }

  res.status(200).json({
    success: true,
    message: 'Purchase Order updated successfully',
    data: updatedPO
  });
});

export const deletePurchaseOrderController = async (req, res) => {
  try {
    const deletedPO = await deletePurchaseOrder(req.params.id);
    
    if (!deletedPO) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found"
      });
    }

    res.json({ 
      success: true,
      message: 'Purchase Order deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete purchase order',
      error: error.message
    });
  }
};








export const createReplacementPOController = async (req, res) => {
  const requestStartTime = Date.now();
  console.log('🚀 Controller: Starting createReplacementPO request');

  // Set response timeout to 30 seconds
  res.setTimeout(30000, () => {
    console.log('⏰ Request timeout - sending 408 response');
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        message: 'Request timeout - operation took too long',
        error: 'TIMEOUT'
      });
    }
  });

  try {
    const {
      disposedMedicines,
      disposedMedicineIds,
      vendorId,
      customQuantities,
      deliveryDays,
      paymentTerms,
      specialInstructions
    } = req.body;

    console.log('🔍 Controller: Validating request body');

    // Basic validation
    if (!disposedMedicineIds || !Array.isArray(disposedMedicineIds) || disposedMedicineIds.length === 0) {
      console.log('❌ Controller: Validation failed - invalid disposedMedicineIds');
      return res.status(400).json({
        success: false,
        message: 'disposedMedicineIds is required and must be a non-empty array',
        error: 'VALIDATION_ERROR'
      });
    }

    if (!vendorId) {
      console.log('❌ Controller: Validation failed - missing vendorId');
      return res.status(400).json({
        success: false,
        message: 'vendorId is required',
        error: 'VALIDATION_ERROR'
      });
    }

    console.log('✅ Controller: Validation passed, calling service');

    // Call service with timeout wrapper
    const servicePromise = createReplacementPO({
      disposedMedicines,
      disposedMedicineIds,
      vendorId,
      customQuantities,
      deliveryDays,
      paymentTerms,
      specialInstructions,
      userId: req.user?.id,
      userName: req.user?.name
    });

    // Add service timeout (25 seconds to leave time for controller timeout)
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: false,
          error: 'Service operation timeout',
          processingTime: 25000
        });
      }, 25000);
    });

    const result = await Promise.race([servicePromise, timeoutPromise]);

    const totalProcessingTime = Date.now() - requestStartTime;
    console.log(`🏁 Controller: Service completed in ${totalProcessingTime}ms`);

    // Handle service response
    if (!result.success) {
      console.log('❌ Controller: Service returned failure:', result.error);
      
      // Handle specific service errors
      if (result.error.includes('Vendor not found')) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found',
          error: 'VENDOR_NOT_FOUND',
          processingTime: totalProcessingTime
        });
      }

      if (result.error.includes('No disposed medicines found')) {
        return res.status(404).json({
          success: false,
          message: 'No disposed medicines found with provided IDs',
          error: 'MEDICINES_NOT_FOUND',
          processingTime: totalProcessingTime
        });
      }

      if (result.error.includes('timeout')) {
        return res.status(408).json({
          success: false,
          message: 'Operation timeout - please try again',
          error: 'SERVICE_TIMEOUT',
          processingTime: totalProcessingTime
        });
      }

      // Generic service error
      return res.status(500).json({
        success: false,
        message: 'Failed to create replacement PO',
        error: result.error,
        processingTime: totalProcessingTime
      });
    }

    // Success response with proper headers
    console.log('✅ Controller: Sending success response');

    // Prepare response data
    const responseData = {
      success: true,
      message: 'Replacement PO created successfully',
      data: {
        ...result.data,
        totalProcessingTime: totalProcessingTime
      }
    };

    // Log the actual response being sent
    console.log('📤 ACTUAL RESPONSE BEING SENT:', JSON.stringify({
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(responseData).length,
        'X-Response-Time': `${totalProcessingTime}ms`,
      },
      body: responseData
    }, null, 2));

    // Set explicit headers to ensure Chrome DevTools visibility
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Response-Time', `${totalProcessingTime}ms`);
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', '*');
    
    // Log headers being sent
    console.log('📋 HEADERS BEING SENT:', res.getHeaders());

    return res.status(201).json(responseData);

  } catch (error) {
    const totalProcessingTime = Date.now() - requestStartTime;
    console.error(`💥 Controller: Unexpected error after ${totalProcessingTime}ms:`, error);
    
    // Ensure response is sent even on unexpected errors
    if (!res.headersSent) {
      // Set headers for error response too
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Response-Time', `${totalProcessingTime}ms`);
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        processingTime: totalProcessingTime
      });
    }
  }
};








export const getReplacementPOsByVendorController = async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    const result = await getReplacementPOsByVendorService(vendorId);
    
    res.status(200).json({
      success: true,
      message: 'Replacement POs retrieved successfully',
      ...result
    });
    
  } catch (error) {
    console.error('Controller: Error fetching replacement POs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch replacement POs',
      error: error.message
    });
  }
};

