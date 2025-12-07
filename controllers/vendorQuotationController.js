import { 
  createVendorQuotation, 
  getQuotationsByRfqId, 
  getVendorQuotationForVendor,
  updateQuotationStatus 
} from "../services/vendorQuotationService.js";

export const createVendorQuotationController = async (req, res) => {
  try {
    const { rfq, vendor, items, totalAmount, gstIncluded, gstPercentage } = req.body;
    
    if (!rfq || !vendor || !items?.length || !totalAmount) {
      return res.status(400).json({ message: "Invalid data provided" });
    }

    // Validate items data
    for (const item of items) {
      if (!item.itemId || !item.unitPrice || !item.quantityRequired) {
        return res.status(400).json({ 
          message: "Each item must have itemId, unitPrice, and quantityRequired" 
        });
      }
    }

    const saved = await createVendorQuotation({ 
      rfq, 
      vendor, 
      items, 
      totalAmount,
      gstIncluded,
      gstPercentage // Pass GST percentage to service
    });
    
    res.status(201).json({
      message: "Vendor quotation submitted successfully",
      quotation: saved
    });
  } catch (err) {
    console.error("Error creating vendor quotation:", err);
    res.status(500).json({ 
      message: "Server error saving quotation",
      error: err.message // Add error details for debugging
    });
  }
};

export const getQuotationsByRfqIdController = async (req, res) => {
  try {
    const { rfqId } = req.params;
    const quotations = await getQuotationsByRfqId(rfqId);
    res.json(quotations);
  } catch (err) {
    console.error("Error fetching quotations:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getVendorQuotationHandlerController = async (req, res) => {
  const { rfqId, _id, vendorId } = req.params;
  const idToUse = rfqId || _id;

  try {
    const rfq = await getVendorQuotationForVendor({ rfqId: idToUse, vendorId });

    if (!rfq) {
      return res.status(404).json({ message: "RFQ not found or vendor not authorized" });
    }

    res.json({
      id: rfq._id,
      sentToVendors: rfq.sentToVendors,
      items: rfq.items,
      status: rfq.status,
      rfqNumber: rfq.rfqNumber,
    });
  } catch (err) {
    console.error("Error fetching vendor quotation:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateQuotationStatusController = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const { status } = req.body;
    
    const updatedQuotation = await updateQuotationStatus(quotationId, status);
    
    if (!updatedQuotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }
    
    res.json({
      message: "Quotation status updated successfully",
      quotation: updatedQuotation
    });
  } catch (err) {
    console.error("Error updating quotation status:", err);
    res.status(500).json({ message: "Server error" });
  }
};
