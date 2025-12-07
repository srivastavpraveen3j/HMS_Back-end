import ReferralRule from "../models/referralRule.js";
import {
  createReferralRule,
  deleteReferralRule,
  getAllReferralRule,
  updateReferralRule,
} from "../services/referralRule.js";
import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import { parseCSVWithHeaders } from "../utils/parseCSVWithHeaders.js";

export const createReferralRuleHandler = asyncHandler(async (req, res) => {
  const { department, services, referralPercent, capLimit } = req.body;

  if ((!department || !services || !referralPercent, !capLimit)) {
    throw new ErrorHandler("All fields are required", 400);
  }

  //   const existService = await getService(name);
  //   if (existService) {
  //     throw new ErrorHandler("Service already exists", 409);
  //   }

  const newRule = await createReferralRule(req.body);

  if (!newRule) {
    throw new ErrorHandler("Failed to create referral rule", 400);
  }

  res.status(201).json(newRule);
});

export const getAllreferralRuleHandler = asyncHandler(async (req, res) => {
  const rules = await getAllReferralRule(req.queryOptions);

  if (!rules) {
    throw new ErrorHandler("No referral rules found", 404);
  }

  res.status(200).json(rules);
});

export const updateReferralRuleHandler = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No update data provided", 400);
  }

  const updatedRules = await updateReferralRule(req.params.id, req.body);

  if (!updatedRules) {
    throw new ErrorHandler("Referral rule not found", 404);
  }

  res.status(200).json(updatedRules);
});

// Delete a service by ID
export const deleteReferralRuleHandler = asyncHandler(async (req, res) => {
  const deletedRules = await deleteReferralRule(req.params.id);

  if (!deletedRules) {
    throw new ErrorHandler("Referral rule not found", 404);
  }

  res.status(200).json({ message: "Referral rule deleted successfully" });
});

export const uploadreferralRule = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const fileContent = req.file.buffer.toString("utf-8");
    const { headers, rows } = parseCSVWithHeaders(fileContent);

    const expectedHeaders = Object.keys(ReferralRule.schema.paths).filter(
      (key) => !["_id", "__v", "createdAt", "updatedAt"].includes(key)
    );

    const headersMatch =
      JSON.stringify(headers) === JSON.stringify(expectedHeaders);
    if (!headersMatch) {
      return res.status(400).json({
        message: "Cannot upload CSV file as headers did not match",
        expected_Headers: expectedHeaders,
        received_Headers: headers,
      });
    }

    console.log(rows);

    if (!rows.length) {
      return res.status(400).json({ message: "CSV file is empty" });
    }

    //==> Get service IDs from CSV rows
    const serviceIdsFromCSV = rows.map((row) => row.serviceName.toString());

    //==> Find ReferralRules with those service IDs
    const existingDocs = await ReferralRule.find({
      serviceName: { $in: serviceIdsFromCSV },
    }).lean();

    const existingServiceIds = new Set(
      existingDocs.map((doc) => doc.serviceName.toString())
    );

    //==> Filter rows that don't yet exist in ReferralRule
    const newRows = rows.filter((row) => {
      const sid = row.serviceName.toString();
      return !existingServiceIds.has(sid);
    });

    if (!newRows.length) {
      return res
        .status(400)
        .json({ message: "All rows already exist in the database" });
    }

    const results = await Promise.all(
      newRows.map(async (row) => {
        try {
          const createdRule = await createReferralRule(row);
          return { success: true, data: createdRule };
        } catch (err) {
          return { success: false, error: err.message, input: row };
        }
      })
    );

    res.status(200).json({
      message: "Referral Rule uploaded successfully",
      headers,
      totalRecords: rows.length,
      inserted: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      skippedNames: Array.from(existingServiceIds),
      sample: results.slice(0, 3),
    });
  } catch (error) {
    console.error("Upload referral rule Error:", error.message);
    return res.status(500).json({ message: error.message });
  }
});
