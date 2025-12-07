import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createInpatientRoomTransferService,
  getAllInpatientRoomTransferService,
  getInpatientRoomTransferByIdService,
  updateInpatientRoomTransferService,
  deleteInpatientRoomTransferService,
  getInpatientRoomTransferByCaseService,
  updateRoomLogService,
} from "../services/InpatientRoomTransfer.js";
import InpatientRoomTransfer from "../models/InpatientRoomTransfers.js";
import InpatientCase from "../models/InpatientCaseSchema.js";

export const createInpatientRoomTransfer = asyncHandler(async (req, res) => {
  const inpatientRoomTransfer = await createInpatientRoomTransferService(
    req.body
  );

  if (!inpatientRoomTransfer) {
    throw new ErrorHandler("Failed to create inpatient room transfer", 400);
  }

  res.status(201).json(inpatientRoomTransfer);
});

export const getAllInpatientRoomTransfer = asyncHandler(async (req, res) => {
  const inpatientRoomTransfers = await getAllInpatientRoomTransferService(
    req.queryOptions
  );

  if (!inpatientRoomTransfers) {
    throw new ErrorHandler(
      "Failed to get all inpatient room transfer data",
      404
    );
  }

  res.status(200).json(inpatientRoomTransfers);
});

export const getInpatientRoomTransferById = asyncHandler(async (req, res) => {
  const inpatientRoomTransfer = await getInpatientRoomTransferByIdService(
    req.params.id
  );

  if (!inpatientRoomTransfer) {
    throw new ErrorHandler("Inpatient room transfer data not found", 404);
  }

  res.status(200).json(inpatientRoomTransfer);
});

// export const getInpatientRoomTransferByCase = asyncHandler(async (req, res) => {
//   const { inpatientCaseId } = req.query;
//   const inpatientRoomTransfer = await getInpatientRoomTransferByCaseService(
//     inpatientCaseId
//   );

//   if (!inpatientRoomTransfer) {
//     throw new ErrorHandler("Inpatient room transfer data not found", 404);
//   }

//   res.status(200).json(inpatientRoomTransfer);
// });

// Helper to normalize any date to midnight UTC (start of the day)
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

export const getInpatientRoomTransferByCase = asyncHandler(async (req, res) => {
  const { inpatientCaseId } = req.query;

  const ipdCase = await InpatientCase.findById(inpatientCaseId);
  if (!ipdCase)
    return res.status(404).json({ message: "Inpatient case not found" });

  const roomTransfer = await InpatientRoomTransfer.findOne({ inpatientCaseId });
  if (!roomTransfer)
    return res
      .status(404)
      .json({ message: "Inpatient room transfer data not found" });

  const today = new Date();
  const normalizedToday = normalizeDate(today);
  const admissionDate = new Date(ipdCase.admissionDate);
  const normalizedAdmissionDate = normalizeDate(admissionDate);

  let startDate = normalizedAdmissionDate;
  if (roomTransfer.lastLogDate) {
    const lastLog = new Date(roomTransfer.lastLogDate);
    const normalizedLastLog = normalizeDate(lastLog);
    if (normalizedLastLog > startDate) {
      startDate = normalizedLastLog; // ✅ Your fixed logic kept
    }
  }

  const addDay = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return d;
  };

  let logsAdded = false;

  const isTransferActiveForDate = (t, logDate) => {
    const start = normalizeDate(new Date(t.transferStartTime));
    if (!t.transferEndTime) return logDate >= start;
    const end = normalizeDate(new Date(t.transferEndTime));
    return logDate >= start && logDate <= end;
  };

  if (startDate <= normalizedToday) {
    for (
      let logDate = new Date(startDate);
      logDate <= normalizedToday;
      logDate = addDay(logDate)
    ) {
      // ✅ Detect if any transfer is active for this date
      const activeTransfer = roomTransfer.transfers?.find((t) =>
        isTransferActiveForDate(t, logDate)
      );

      if (
        roomTransfer.primaryBed.bedId?.toString() ===
        roomTransfer.currentBed.bedId?.toString()
      ) {
        const exists = roomTransfer.dailyRoomChargeLogs.some(
          (log) =>
            log.date &&
            normalizeDate(log.date).getTime() === logDate.getTime() &&
            log.bedId.toString() === roomTransfer.primaryBed.bedId.toString()
        );

        if (!exists) {
          roomTransfer.dailyRoomChargeLogs.push({
            date: logDate,
            roomId: roomTransfer.primaryBed.roomId,
            roomNumber: roomTransfer.primaryBed.roomNumber,
            bedId: roomTransfer.primaryBed.bedId,
            bedNumber: roomTransfer.primaryBed.bedNumber,
            originalRoomCharge: roomTransfer.primaryBed.originalRoomCharge,
            originalBedCharge: roomTransfer.primaryBed.originalBedCharge,
            roomCharge: roomTransfer.primaryBed.roomCharge,
            bedCharge: roomTransfer.primaryBed.bedCharge,
            remarks: "Primary bed",
          });
          logsAdded = true;
        }
      } else {
        const loggedPrimary = roomTransfer.dailyRoomChargeLogs.some(
          (log) =>
            log.date &&
            normalizeDate(log.date).getTime() === logDate.getTime() &&
            log.bedId.toString() === roomTransfer.primaryBed.bedId.toString()
        );
        if (!loggedPrimary) {
          roomTransfer.dailyRoomChargeLogs.push({
            date: logDate,
            roomId: roomTransfer.primaryBed.roomId,
            roomNumber: roomTransfer.primaryBed.roomNumber,
            bedId: roomTransfer.primaryBed.bedId,
            bedNumber: roomTransfer.primaryBed.bedNumber,
            originalRoomCharge: roomTransfer.primaryBed.originalRoomCharge,
            originalBedCharge: roomTransfer.primaryBed.originalBedCharge,
            roomCharge: roomTransfer.primaryBed.roomCharge,
            bedCharge: roomTransfer.primaryBed.bedCharge,
            remarks: "Primary bed (reserved)",
          });
          logsAdded = true;
        }

        // ✅ Current bed log only if transfer is ACTIVE
        if (activeTransfer) {
          const loggedCurrent = roomTransfer.dailyRoomChargeLogs.some(
            (log) =>
              log.date &&
              normalizeDate(log.date).getTime() === logDate.getTime() &&
              log.bedId.toString() === roomTransfer.currentBed.bedId.toString()
          );
          if (!loggedCurrent) {
            roomTransfer.dailyRoomChargeLogs.push({
              date: logDate,
              roomId: roomTransfer.currentBed.roomId,
              roomNumber: roomTransfer.currentBed.roomNumber,
              bedId: roomTransfer.currentBed.bedId,
              bedNumber: roomTransfer.currentBed.bedNumber,
              originalRoomCharge: roomTransfer.currentBed.originalRoomCharge,
              originalBedCharge: roomTransfer.currentBed.originalBedCharge,
              roomCharge: roomTransfer.currentBed.roomCharge,
              bedCharge: roomTransfer.currentBed.bedCharge,
              // isFullDay: true,
              remarks: "Temporary transfer",
            });
            logsAdded = true;
          }
        }
      }

      // ✅ Same-day transfer logs (already correct, just add active check)
      if (Array.isArray(roomTransfer.transfers)) {
        const thisDayTransfers = roomTransfer.transfers.filter((t) =>
          isTransferActiveForDate(t, logDate)
        );

        for (const t of thisDayTransfers) {
          const bedId = t.to?.bedId;
          if (!bedId) continue;

          const alreadyLogged = roomTransfer.dailyRoomChargeLogs.some(
            (log) =>
              log.date &&
              normalizeDate(log.date).getTime() === logDate.getTime() &&
              log.bedId.toString() === bedId.toString()
          );

          if (!alreadyLogged) {
            roomTransfer.dailyRoomChargeLogs.push({
              date: logDate,
              roomId: t.to?.roomId,
              roomNumber: t.to?.roomNumber,
              bedId,
              bedNumber: t.to?.bedNumber,
              originalRoomCharge: t.to?.originalRoomCharge,
              originalBedCharge: t.to?.originalBedCharge,
              roomCharge: t.to?.roomCharge,
              bedCharge: t.to?.bedCharge,
              // isFullDay: true,
              remarks:
                t.transferType === "permanent"
                  ? "Permanent transfer"
                  : "Temporary transfer",
            });
            logsAdded = true;
          }
        }
      }
    }

    if (logsAdded) {
      roomTransfer.lastLogDate = normalizedToday;
      await roomTransfer.save();
    }
  }

  res.json(roomTransfer);
});


export const updateInpatientRoomTransfer = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler(
      "Please provide a valid inpatient room transfer data",
      400
    );
  }

  const { id, transferId } = req.params;
  // const { primaryBed, transferEndTime, totalCharge } = req.body;

  const inpatientRoomTransfer = await updateInpatientRoomTransferService(
    id,
    transferId,
    req.body
  );

  if (!inpatientRoomTransfer) {
    throw new ErrorHandler("Inpatient room transfer or data not found", 404);
  }

  res.status(200).json(inpatientRoomTransfer);
});

export const updateInpatientRoomLog = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("Please provide a valid inpatient room log", 400);
  }

  const { id, logId } = req.params;
  const inpatientRoomLog = await updateRoomLogService(id, logId, req.body);

  if (!inpatientRoomLog) {
    throw new ErrorHandler("Inpatient Room Log not found", 404);
  }

  res.status(200).json(inpatientRoomLog);
});

// PATCH /roomtransfer/:id/transfers/add
export const addNewTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      from,
      to,
      transferStartTime,
      transferEndTime,
      roomCharge,
      bedCharge,
      totalCharge,
      transferType,
      transferReason,
      remark,
      transferredBy,
    } = req.body;

    const newTransfer = {
      from,
      to,
      transferStartTime,
      transferEndTime,
      roomCharge,
      bedCharge,
      totalCharge,
      transferType,
      transferReason,
      remark,
      transferredBy,
    };

    // Merge bed charges into destination bed info
    const updatedTo = {
      ...to,
      roomCharge,
      bedCharge,
      assignedDate: new Date(),
    };

    // Prepare update object
    const updateFields = {
      $push: { transfers: newTransfer },
      $set: { currentBed: updatedTo },
    };

    // If the transfer is permanent, also update primaryBed
    if (transferType === "permanent") {
      updateFields.$set.primaryBed = updatedTo;
    }

    const updatedDoc = await InpatientRoomTransfer.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    res.json({ success: true, data: updatedDoc });
  } catch (error) {
    console.error("Error adding new transfer", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteInpatientRoomTransfer = asyncHandler(async (req, res) => {
  const inpatientRoomTransfer = await deleteInpatientRoomTransferService(
    req.params.id
  );

  if (!inpatientRoomTransfer) {
    throw new ErrorHandler("Inpatient room transfer data not found", 404);
  }

  res
    .status(200)
    .json({ message: "Inpatient room transfer deleted successfully" });
});
