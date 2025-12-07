import asyncHandler from '../utils/asyncWrapper.js';
import ErrorHandler from '../utils/CustomError.js';
import {
  createVisitTypeMaster,
  getAllVisitTypeMasters,
  getVisitTypeMaster,
  updateVisitTypeMaster,
  deleteVisitTypeMaster,
  getVisitTypeMasterById,
  findExistingDoctorRoomRate,
  findExistingDoctorRoomService,
} from '../services/visitTypeMaster.js';

// helper: enrich procedureServices with baseServiceCharge + final total
const prepareProcedurePayload = (visitType, body) => {
  if (visitType !== 'procedure' || !Array.isArray(body.procedureServices)) {
    return body;
  }

  // build roomRate map from doctorRates
  const roomRateMap = {};
  if (Array.isArray(body.doctorRates)) {
    body.doctorRates.forEach((dr) => {
      const roomId = dr.roomTypeId?.toString?.() || dr.roomTypeId || null;
      if (!roomId) return;
      roomRateMap[roomId] = Number(dr.roomRate || 0);
    });
  }

  const prepared = body.procedureServices.map((ps) => {
    const roomId = ps.roomTypeId?.toString?.() || ps.roomTypeId;
    const roomRate = roomRateMap[roomId] || 0;
    const baseService = Number(ps.baseServiceCharge ?? ps.serviceAmount ?? 0);

    return {
      ...ps,
      baseServiceCharge: baseService,
      serviceAmount: baseService + roomRate, // final = pure + room
    };
  });

  return {
    ...body,
    procedureServices: prepared,
  };
};

// Create new VisitTypeMaster
export const createVisitTypeMasterController = asyncHandler(
  async (req, res) => {
    const { headName, visitType, doctorRates, procedureServices } = req.body;

    if (!headName || !visitType) {
      throw new ErrorHandler('Head name and visit type are required', 400);
    }

    const existingVisitType = await getVisitTypeMaster(headName);
    if (existingVisitType) {
      throw new ErrorHandler('Visit type head already exists', 409);
    }

    // Validate required arrays based on visitType
    if (visitType === 'visit' && (!doctorRates || doctorRates.length === 0)) {
      throw new ErrorHandler('Doctor rates required for visit type', 400);
    }
    if (
      visitType === 'procedure' &&
      (!procedureServices || procedureServices.length === 0)
    ) {
      throw new ErrorHandler(
        'Procedure services required for procedure type',
        400
      );
    }

    // DUPLICATE CHECKS FOR CREATE
    if (visitType === 'visit' && Array.isArray(doctorRates)) {
      const seenPairs = new Set();

      for (const rate of doctorRates) {
        const key = `${rate.doctorId}::${rate.roomTypeId || 'null'}`;
        if (seenPairs.has(key)) {
          throw new ErrorHandler(
            'Duplicate doctor-room combination in request payload for visit type',
            400
          );
        }
        seenPairs.add(key);

        const exists = await findExistingDoctorRoomRate(
          rate.doctorId,
          rate.roomTypeId || null
        );
        if (exists) {
          throw new ErrorHandler(
            'Rate already assigned for this doctor and room type',
            409
          );
        }
      }
    }

    if (visitType === 'procedure' && Array.isArray(procedureServices)) {
      const seenTriples = new Set();

      for (const ps of procedureServices) {
        const key = `${ps.doctorId}::${ps.roomTypeId}::${ps.serviceId}`;
        if (seenTriples.has(key)) {
          throw new ErrorHandler(
            'Duplicate doctor-room-service combination in request payload for procedure type',
            400
          );
        }
        seenTriples.add(key);

        const exists = await findExistingDoctorRoomService(
          ps.doctorId,
          ps.roomTypeId,
          ps.serviceId
        );
        if (exists) {
          throw new ErrorHandler(
            'This service for this doctor and room type is already assigned',
            409
          );
        }
      }
    }

    // prepare totals for procedure
    const payload = prepareProcedurePayload(visitType, req.body);

    const newVisitType = await createVisitTypeMaster(payload);
    res.status(201).json(newVisitType);
  }
);

// Get all VisitTypeMasters
export const getAllVisitTypeMastersController = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, headName } = req.query;

  // Prepare query options
  const queryOptions = {
    limit: parseInt(limit),
    page: parseInt(page),
    params: {
      query: {
        headName: headName || '' // Pass headName for search processing
      }
    }
  };

  const visitTypes = await getAllVisitTypeMasters(queryOptions);
  res.status(200).json(visitTypes);
});

// Get VisitTypeMaster by ID
export const getVisitTypeMasterByIdController = asyncHandler(
  async (req, res) => {
    const visitType = await getVisitTypeMasterById(req.params.id);
    if (!visitType) {
      throw new ErrorHandler('Visit type not found', 404);
    }
    res.status(200).json(visitType);
  }
);

// Update VisitTypeMaster
export const updateVisitTypeMasterController = asyncHandler(
  async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ErrorHandler('No update data provided', 400);
    }

    const { visitType, doctorRates, procedureServices } = req.body;
    const id = req.params.id;

    // DUPLICATE CHECKS FOR UPDATE
    if (visitType === 'visit' && Array.isArray(doctorRates)) {
      const seenPairs = new Set();

      for (const rate of doctorRates) {
        const key = `${rate.doctorId}::${rate.roomTypeId || 'null'}`;
        if (seenPairs.has(key)) {
          throw new ErrorHandler(
            'Duplicate doctor-room combination in request payload for visit type',
            400
          );
        }
        seenPairs.add(key);

        const exists = await findExistingDoctorRoomRate(
          rate.doctorId,
          rate.roomTypeId || null,
          id
        );
        if (exists) {
          throw new ErrorHandler(
            'Rate already assigned for this doctor and room type',
            409
          );
        }
      }
    }

    if (visitType === 'procedure' && Array.isArray(procedureServices)) {
      const seenTriples = new Set();

      for (const ps of procedureServices) {
        const key = `${ps.doctorId}::${ps.roomTypeId}::${ps.serviceId}`;
        if (seenTriples.has(key)) {
          throw new ErrorHandler(
            'Duplicate doctor-room-service combination in request payload for procedure type',
            400
          );
        }
        seenTriples.add(key);

        const exists = await findExistingDoctorRoomService(
          ps.doctorId,
          ps.roomTypeId,
          ps.serviceId,
          id
        );
        if (exists) {
          throw new ErrorHandler(
            'This service for this doctor and room type is already assigned',
            409
          );
        }
      }
    }

    // prepare totals for procedure
    const payload = prepareProcedurePayload(visitType, req.body);

    const updatedVisitType = await updateVisitTypeMaster(id, payload);
    if (!updatedVisitType) {
      throw new ErrorHandler('Visit type not found', 404);
    }
    res.status(200).json(updatedVisitType);
  }
);

// Delete VisitTypeMaster
export const deleteVisitTypeMasterController = asyncHandler(
  async (req, res) => {
    const deletedVisitType = await deleteVisitTypeMaster(req.params.id);
    if (!deletedVisitType) {
      throw new ErrorHandler('Visit type not found', 404);
    }
    res.status(200).json({ message: 'Visit type deleted successfully' });
  }
);
