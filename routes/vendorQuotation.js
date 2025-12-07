// import express from "express";
// import requestForQuotation from "../models/requestForQuotation.js";
// import VendorQuotation from "../models/vendorQuotation.js";
// import mongoose from "mongoose";
// const router = express.Router();

// const getVendorQuotationHandler = async (req, res) => {
//   const { rfqId, _id, vendorId } = req.params;
//   const idToUse = rfqId || _id;

//   try {
//     const rfq = await requestForQuotation
//       .findOne({
//         _id: idToUse,
//         sentToVendors: vendorId,
//       })
//       .populate("sentToVendors"); // ✅ populate here, on the query

//     if (!rfq) {
//       return res.status(404).json({ message: "RFQ not found" });
//     }

//     res.json({
//       id: rfq._id,
//       sentToVendors: rfq.sentToVendors,
//       items: rfq.items,
//       status: rfq.status,
//       rfqNumber: rfq.rfqNumber,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ POST: Vendor submits a quotation
// router.post("/", async (req, res) => {
//   try {
//     const { rfq, vendor, items } = req.body;

//     if (!rfq || !vendor || !items?.length) {
//       return res.status(400).json({ message: "Invalid data" });
//     }

//     const vendorQuotation = new VendorQuotation({
//       rfq,
//       vendor,
//       items,
//     });

//     const saved = await vendorQuotation.save();

//     res.status(201).json(saved);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error saving quotation" });
//   }
// });

// // ✅ GET: All vendor quotations for a particular RFQ
// router.get("/rfq/:rfqId", async (req, res) => {
//   try {
//     const { rfqId } = req.params;

//     const quotations = await VendorQuotation.find({
//       rfq: new mongoose.Types.ObjectId(rfqId),
//     })
//       .populate("vendor", "vendorName email phone")
//       .populate("rfq", "rfqNumber");

//     res.json(quotations);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // NOTE: here you ONLY need the suffix paths
// router.get("/:rfqId/vendor/:vendorId", getVendorQuotationHandler);
// router.get(
//   "/request-quotation/:_id/vendor/:vendorId",
//   getVendorQuotationHandler
// );

// export default router;

import express from "express";
import { createVendorQuotationController, getQuotationsByRfqIdController, getVendorQuotationHandlerController } from "../controllers/vendorQuotationController.js";


const router = express.Router();

// POST: Vendor submits a quotation
router.post("/", createVendorQuotationController );

// GET: All vendor quotations for a particular RFQ
router.get("/rfq/:rfqId", getQuotationsByRfqIdController);

// GET: Vendor's specific quotation for RFQ
router.get("/:rfqId/vendor/:vendorId", getVendorQuotationHandlerController);

router.get(
  "/request-quotation/:_id/vendor/:vendorId",
  getVendorQuotationHandlerController
);

export default router;
