import { deleteAudit, getAudit, getAudits, updateAudit } from "../services/auditLog.js";
import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";

export const getAllAuditHandler = asyncHandler(async (req, res) => {
  const audit = await getAudits(req.queryOptions);

  if (!audit) {
    throw new ErrorHandler("No audit found", 404);
  }

  res.status(200).json(audit);
});

export const getAuditHandler = asyncHandler(async (req, res) => {
  const audit = await getAudit(req.params.id);

  if (!audit) {
    throw new ErrorHandler("No audit found", 404);
  }

  res.status(200).json(audit);
});

export const updateAuditHandler = asyncHandler(async (req, res) => {
    const audit = await updateAudit(req.params.id, data);

    if(!audit){
        throw new ErrorHandler("Audit not found", 404);
    }

    res.status(200).json(audit);
})

// Delete a service by ID
export const deleteAuditHandler = asyncHandler(async (req, res) => {
  const deletedAudit = await deleteAudit(req.params.id);

  if (!deletedAudit) {
    throw new ErrorHandler("Audit not found", 404);
  }

  res.status(200).json({ message: "Audit deleted successfully" });
});

