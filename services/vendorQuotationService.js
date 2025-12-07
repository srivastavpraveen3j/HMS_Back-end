import VendorQuotation from "../models/vendorQuotation.js";
import requestForQuotation from "../models/requestForQuotation.js";
import mongoose from "mongoose";

// services/vendorQuotationService.js

export const createVendorQuotation = async ({ 
  rfq, 
  vendor, 
  items, 
  totalAmount, 
  gstIncluded, 
  gstPercentage 
}) => {
  try {
    // *** DON'T RECALCULATE - USE VENDOR'S PROVIDED VALUES ***
    
    // Calculate GST amount for display purposes only (if GST is included)
    let gstAmount = 0;
    let finalAmount = totalAmount; // Vendor's totalAmount IS the final amount
    
    if (gstIncluded && gstPercentage) {
      // Calculate GST component for display (reverse calculation)
      // If totalAmount includes GST, then: subtotal = totalAmount / (1 + gstRate)
      const subtotal = totalAmount / (1 + (gstPercentage / 100));
      gstAmount = totalAmount - subtotal;
    }

    // Create vendor quotation with VENDOR'S EXACT VALUES
    const vendorQuotation = new VendorQuotation({
      rfq,
      vendor,
      items, // Use vendor's items as-is
      totalAmount, // Vendor's final amount (this is what matters)
      gstIncluded: gstIncluded || false,
      gstPercentage: gstPercentage || 0,
      gstAmount: Math.round(gstAmount * 100) / 100, // Round to 2 decimal places
      finalAmount: finalAmount, // Same as totalAmount - vendor's final price
      status: 'submitted',
      submittedAt: new Date()
    });

    const saved = await vendorQuotation.save();
    return saved;

  } catch (error) {
    console.error('Error creating vendor quotation:', error);
    throw new Error('Failed to save vendor quotation: ' + error.message);
  }
};



export const getQuotationsByRfqId = async (rfqId) => {
  return VendorQuotation.find({ rfq: new mongoose.Types.ObjectId(rfqId) })
    .populate("vendor", "vendorName email phone")
    .populate("rfq", "rfqNumber");
};

export const getVendorQuotationForVendor = async ({ rfqId, vendorId }) => {
  const rfq = await requestForQuotation
    .findOne({ _id: rfqId, sentToVendors: vendorId })
    .populate("sentToVendors")
    .populate("items");
  return rfq;
};

export const updateQuotationStatus = async (quotationId, status) => {
  return VendorQuotation.findByIdAndUpdate(
    quotationId,
    { status },
    { new: true }
  );
};
