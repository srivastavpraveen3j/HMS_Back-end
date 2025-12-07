import requestForQuotation from "../models/requestForQuotation.js";
import VendorQuotation from "../models/vendorQuotation.js";
import Vendor from "../models/vendor.js";
import asyncHandler from "../utils/asyncWrapper.js";
export const getVendorQuotationPageData = asyncHandler(async (req, res) => {
  const { rfqId, vendorId } = req.params;

  const rfq = await requestForQuotation.findById(rfqId).populate("sentToVendors");

  if (!rfq) {
    res.status(404);
    throw new Error("RFQ not found");
  }

  const vendor = rfq.sentToVendors.find(v => v._id.toString() === vendorId);

  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not authorized for this RFQ");
  }

  res.json({
    rfqId: rfq._id,
    rfqNumber: rfq.rfqNumber,
    status: rfq.status,
    items: rfq.items,
    vendor: {
      _id: vendor._id,
      vendorName: vendor.vendorName,
      contactPerson: vendor.contactPerson,
      email: vendor.email
    }
  });
});