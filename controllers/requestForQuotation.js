import {
  createRequestForQuotation,
  getAllRequestForQuotations,
  getRequestForQuotationById,
  updateRequestForQuotation,
  deleteRequestForQuotation,
  getRFQWithComparison,
  selectFinalVendor,
  markRFQAsCompared,
} from "../services/requestForQuotation.js";
import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import { sendEmail } from "../utils/sendMail.js";
import requestForQuotation from "../models/requestForQuotation.js";
import { generateRFQCsv } from "../constants/csv.js";

export const createRequestForQuotationController = asyncHandler(
  async (req, res) => {
    const rfq = await createRequestForQuotation(req.body);
    if (!rfq) {
      throw new Error("❌ Failed to create Request for Quotation");
    }

    const populatedRFQ = await rfq.populate("sentToVendors");

    const itemsList = populatedRFQ.items
      .map((item, index) => {
        return `${index + 1}. ${item.itemName} (${item.quantityRequired} - ${item.category}, Dept: ${item.departmentName}, Remarks: ${item.remarks})`;
      })
      .join("\n");

    const baseTemplateVars = {
      rfqNumber: populatedRFQ.rfqNumber || populatedRFQ._id.toString(),
      items: itemsList,
      deadline: populatedRFQ.deadline || "N/A",
    };

    const csvBuffer = generateRFQCsv(populatedRFQ);
    const attachments = [
      {
        filename: `${baseTemplateVars.rfqNumber}.csv`,
        content: csvBuffer,
      },
    ];

    const emailResults = [];

    for (const vendor of populatedRFQ.sentToVendors) {
      const vendorEmail = vendor.email;
      if (!vendorEmail) continue;

      const vendorTemplateVars = {
        rfqNumber: populatedRFQ.rfqNumber || populatedRFQ._id.toString(),
        items: itemsList,
        deadline: populatedRFQ.deadline || "N/A",
        contactPerson: vendor.contactPerson || "Vendor",
        vendorName: vendor.vendorName || "",
        quotationLink: `${process.env.FRONTEND_URL_VENDOR}/vendorquotation/${populatedRFQ._id}/${vendor._id}`
      };

      try {
        await sendEmail(vendorEmail, "rfq_sent_to_vendors", vendorTemplateVars);
        emailResults.push({ email: vendorEmail, status: "sent" });
      } catch (err) {
        emailResults.push({ email: vendorEmail, status: "failed", error: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: "RFQ created and emails sent (attempted)",
      data: populatedRFQ,
      emailResults,
    });
  }
);

export const getAllRequestForQuotationController = asyncHandler(
  async (req, res) => {
    const pageData = await getAllRequestForQuotations(res.paginatedResults);
    if (!pageData) {
      throw new ErrorHandler("No Request for Quotation Found", 404);
    }
    res.status(200).json(pageData);
  }
);

export const getByIdRequestForQuotationController = async (req, res) => {
  try {
    const rfq = await getRequestForQuotationById(req.params.id);
    if (!rfq) {
      return res.status(404).json({ message: "RFQ not found" });
    }
    res.json(rfq);
  } catch (error) {
    res.status(500).json({ message: "Error fetching RFQ", error: error.message });
  }
};

// New controller for RFQ comparison
export const getRFQComparisonController = async (req, res) => {
  try {
    const { id } = req.params;
    const comparisonData = await getRFQWithComparison(id);
    
    // Mark as compared if not already
    await markRFQAsCompared(id);
    
    res.json({
      success: true,
      message: "RFQ comparison data retrieved successfully",
      data: comparisonData
    });
  } catch (error) {
    console.error("Error in getRFQComparisonController:", error);
    res.status(500).json({ 
      success: false,
      message: "Error retrieving RFQ comparison", 
      error: error.message 
    });
  }
};

// Controller to select final vendor
export const selectFinalVendorController = async (req, res) => {
  try {
    const { id } = req.params; // RFQ ID
    const { vendorId, totalSavings, remarks } = req.body;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required"
      });
    }

    const updatedRFQ = await selectFinalVendor(id, vendorId, {
      totalSavings,
      remarks
    });

    res.json({
      success: true,
      message: "Final vendor selected successfully",
      data: updatedRFQ
    });
  } catch (error) {
    console.error("Error in selectFinalVendorController:", error);
    res.status(500).json({
      success: false,
      message: "Error selecting final vendor",
      error: error.message
    });
  }
};

export const updateRequestForQuotationController = async (req, res) => {
  try {
    const updated = await updateRequestForQuotation(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating RFQ", error: error.message });
  }
};

export const removeRequestForQuotationController = async (req, res) => {
  try {
    await deleteRequestForQuotation(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Error deleting RFQ", error: error.message });
  }
};
