// controllers/distributionController.js
import multer from "multer";
import fs from "fs";
import { parseCSVWithHeaders } from "../utils/parseCSVWithHeaders.js"; // Remember to `npm install csv-parser`
import Medicine from "../models/medicine.js";
import distributionService from "../services/distributionService.js";
import mongoose from "mongoose";
import DistributionTransfer from "../models/distributionTransfer.js";
class DistributionController {
  async createTransfer(req, res) {
    try {
      const transferData = {
        ...req.body,
        requested_by: req.user?.name || "System Admin",
      };

      const transfer = await distributionService.createTransfer(transferData);

      res.status(201).json({
        success: true,
        message: "Transfer request created successfully",
        data: transfer,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // controllers/distributionController.js
  async approveTransfer(req, res) {
    try {
      const { transferId } = req.params;
      const { approvalData } = req.body;
      const approvedBy = req.user?.name || "Admin";

      console.log(`Approving transfer: ${transferId}`);

      // This will now approve AND process the transfer automatically
      const transfer = await distributionService.approveTransfer(
        transferId,
        approvedBy,
        approvalData
      );

      res.json({
        success: true,
        message:
          "Transfer approved and stock moved to sub-pharmacy successfully",
        data: transfer,
      });
    } catch (error) {
      console.error("Error in approveTransfer controller:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async processTransfer(req, res) {
    try {
      const { transferId } = req.params;

      const transfer = await distributionService.processTransfer(transferId);

      res.json({
        success: true,
        message: "Transfer processed successfully",
        data: transfer,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async completeTransfer(req, res) {
    try {
      const { transferId } = req.params;

      const transfer = await distributionService.completeTransfer(transferId);

      res.json({
        success: true,
        message: "Transfer completed successfully",
        data: transfer,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async bulkTransferFromCSV(req, res) {
    const session = await mongoose.startSession();

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const subPharmacyId = req.body.subPharmacyId;
      if (!subPharmacyId) {
        return res
          .status(400)
          .json({ message: "subPharmacyId is required in body" });
      }

      const fileContent = req.file.buffer.toString("utf-8");
      const { headers, rows } = parseCSVWithHeaders(fileContent);

      const expectedHeaders = ["medicine_name", "requested_quantity"];

      const headersMatch =
        JSON.stringify(headers) === JSON.stringify(expectedHeaders);
      if (!headersMatch) {
        return res.status(400).json({
          message: "Cannot upload CSV file as headers did not match",
          expected_Headers: expectedHeaders,
          received_Headers: headers,
        });
      }

      // ✅ DON'T start transaction here - let the service handle it
      console.log("🔄 Processing bulk transfer without pre-deducting stock");

      const results = await Promise.all(
        rows.map(async (row) => {
          try {
            const requestedQuantity = Number(row.requested_quantity);

            // ✅ ONLY validate - DON'T deduct stock yet
            const medicine = await Medicine.findOne({
              medicine_name: row.medicine_name,
            });

            if (!medicine) {
              throw new Error(`Medicine not found: ${row.medicine_name}`);
            }

            // Check sufficient stock but DON'T deduct
            if (medicine.stock < requestedQuantity) {
              throw new Error(
                `Insufficient stock for ${row.medicine_name}. Available: ${medicine.stock}, Requested: ${requestedQuantity}`
              );
            }

            console.log(
              `✅ Validation passed: ${row.medicine_name} - Available: ${medicine.stock}, Requesting: ${requestedQuantity}`
            );

            return {
              success: true,
              item: {
                medicine: medicine._id,
                medicine_name: medicine.medicine_name,
                requested_quantity: requestedQuantity,
                unit_price: medicine.price,
                batch_details: [
                  {
                    batch_no: medicine.batch_no,
                    expiry_date: medicine.expiry_date,
                    mfg_date: medicine.mfg_date,
                    unit_price: medicine.price,
                    quantity: requestedQuantity,
                  },
                ],
              },
            };
          } catch (err) {
            console.error(
              `❌ Error validating ${row.medicine_name}:`,
              err.message
            );
            return { success: false, error: err.message, input: row };
          }
        })
      );

      const validItems = results.filter((r) => r.success).map((r) => r.item);
      const failedItems = results.filter((r) => !r.success);

      console.log(
        `📊 Validation complete: ${validItems.length} valid, ${failedItems.length} failed`
      );

      if (validItems.length === 0) {
        return res.status(400).json({
          message: "No valid transfer items found in upload",
          failed: failedItems.length,
          failures: failedItems.slice(0, 3),
        });
      }

      // ✅ FIXED: Create transfer as 'pending' and let normal approval workflow handle stock deduction
      console.log("🔄 Creating pending transfer...");
      const transfer = await distributionService.createTransfer({
        to: subPharmacyId,
        items: validItems,
        requested_by: req.user?.name || "BulkUploader",
        status: "pending", // ✅ CHANGED: Create as pending - requires approval
        priority: "normal",
      });

      console.log("✅ Transfer created as pending:", transfer.transferId);

      return res.status(200).json({
        message: "Bulk transfer created successfully - awaiting approval",
        headers,
        totalRecords: rows.length,
        uploaded: validItems.length,
        failed: failedItems.length,
        failures: failedItems.slice(0, 3),
        transferId: transfer.transferId,
        transferSample: transfer.items
          ? transfer.items.slice(0, 3)
          : validItems.slice(0, 3),
        status: "pending",
        requiresApproval: true,
      });
    } catch (error) {
      console.error("❌ Bulk Transfer Error:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }

  async getAllTransfers(req, res) {
    try {
      const filters = {
        status: req.query.status,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
      };

      const transfers = await distributionService.getAllTransfers(filters);

      res.json({
        success: true,
        data: transfers,
        count: transfers.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getTransferById(req, res) {
    try {
      const { transferId } = req.params;

      const transfer = await distributionService.getTransferById(transferId);

      res.json({
        success: true,
        data: transfer,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getTransferSummary(req, res) {
    try {
      const summary = await distributionService.getTransferSummary();

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async exportTransfers(req, res) {
    try {
      const transfers = await distributionService.getAllTransfers(req.query);

      // Simple CSV export
      const csvData = transfers.map((transfer) => ({
        transferId: transfer.transferId,
        from: transfer.from,
        to: transfer.to.name,
        status: transfer.status,
        totalItems: transfer.total_items_count,
        totalValue: transfer.total_value,
        createdAt: transfer.createdAt.toISOString().split("T")[0],
      }));

      res.json({
        success: true,
        data: csvData,
        message: "Export data prepared successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new DistributionController();
