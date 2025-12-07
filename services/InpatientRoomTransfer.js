import InpatientRoomTransfer from "../models/InpatientRoomTransfers.js";

export const createInpatientRoomTransferService = async (data) => {
  try {
    const inpatientRoomTransfer = await InpatientRoomTransfer.create(data);
    return inpatientRoomTransfer;
  } catch (error) {
    throw error;
  }
};

export const getAllInpatientRoomTransferService = async ({
  limit,
  page,
  params,
}) => {
  try {
    const { query } = params;
    const transfers = await InpatientRoomTransfer.find(query)
      .populate("inpatientCaseId")
      .populate({
        path: "inpatientCaseId",
        populate: { path: "uniqueHealthIdentificationId" },
      })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await InpatientRoomTransfer.countDocuments(query);

    return {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      transfers,
    };
  } catch (error) {
    throw error;
  }
};

export const getInpatientRoomTransferByIdService = async (id) => {
  try {
    const inpatientRoomTransfer = await InpatientRoomTransfer.findById(id)
      .populate("inpatientCaseId")
      .populate({
        path: "inpatientCaseId",
        populate: { path: "uniqueHealthIdentificationId" },
      });
    return inpatientRoomTransfer;
  } catch (error) {
    throw error;
  }
};

export const getInpatientRoomTransferByCaseService = async (
  inpatientCaseId
) => {
  return await InpatientRoomTransfer.findOne({ inpatientCaseId }).populate(
    "inpatientCaseId"
  );
};

export const updateInpatientRoomTransferService = async (
  id,
  transferId,
  data
) => {
  try {
    const inpatientRoomTransfer = await InpatientRoomTransfer.findOneAndUpdate(
      { _id: id, "transfers._id": transferId },
      {
        $set: {
          currentBed: data.primaryBed,
          "transfers.$.transferEndTime": data.transferEndTime,
          "transfers.$.totalCharge": data.totalCharge,
        },
      },
      { new: true }
    );
    return inpatientRoomTransfer;
  } catch (error) {
    throw error;
  }
};

export const updateRoomLogService = async (id, logId, data) => {
  try {
    const inpatientRoomLog = await InpatientRoomTransfer.findOneAndUpdate(
      { _id: id, "dailyRoomChargeLogs._id": logId },
      {
        $set: {
          "dailyRoomChargeLogs.$.roomCharge": data.roomCharge,
          "dailyRoomChargeLogs.$.bedCharge": data.bedCharge,
          "dailyRoomChargeLogs.$.isHalfDay": data.isHalfDay,
          "dailyRoomChargeLogs.$.isFullDay": data.isFullDay,
        },
      },
      { new: true }
    );
    return inpatientRoomLog;
  } catch (error) {
    throw error;
  }
};

export const deleteInpatientRoomTransferService = async (id) => {
  try {
    const inpatientRoomTransfer = await InpatientRoomTransfer.findByIdAndDelete(
      id
    );
    return inpatientRoomTransfer;
  } catch (error) {
    throw error;
  }
};
