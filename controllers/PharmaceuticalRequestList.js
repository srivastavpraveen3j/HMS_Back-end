import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createPharmaceuticalRequestList,
  getPharmaceuticalRequestList,
  updatePharmaceuticalRequestList,
  deletePharmaceuticalRequestList,
  getAllPharmaceuticalRequestList,
  getPharmaceuticalRequestByCase,
  createwithoutIPDpermissionPharmaceuticalRequestList,
  getAllwithoutIPDpermissionPharmaceuticalRequestList,
  getwithoutIPDpermissionPharmaceuticalRequestList,
  updatewithoutIPDpermissionPharmaceuticalRequestList,
  deletewithoutIPDpermissionPharmaceuticalRequestList,
  getwithoutIPDpermissionPharmaceuticalRequestByCase
} from "../services/PharmaceuticalRequestList.js";
import UHID from "../models/uhid.js";
import Medicine from "../models/medicine.js"
import mongoose from "mongoose";


export const createPharmaceuticalRequestListController = asyncHandler(
  async (req, res) => {
    const {
      uniqueHealthIdentificationId,
      requestForType,
      billingType,
      pharmacistUserId,
      packages = [],
    } = req.body;

    if (!requestForType || !billingType || !pharmacistUserId) {
      throw new ErrorHandler("All fields are required", 400);
    }

    const existUHID = await UHID.findById(uniqueHealthIdentificationId);
    if (!existUHID) {
      throw new ErrorHandler("UHID does not exist", 404);
    }

    // Validate each medicine's stock
    for (const pkg of packages) {
      const { medicineName, quantity } = pkg;

      const medicine = await Medicine.findOne({ medicine_name: medicineName });

      if (!medicine) {
        throw new ErrorHandler(`Medicine '${medicineName}' not found`, 404);
      }

      if (medicine.stock === 0) {
        throw new ErrorHandler(
          `Medicine '${medicineName}' is out of stock. Cannot create request.`,
          400
        );
      }

      if (medicine.stock < quantity) {
        throw new ErrorHandler(
          `Requested quantity (${quantity}) for '${medicineName}' exceeds available stock (${medicine.stock})`,
          400
        );
      }
    }

    // All medicines are valid and in stock
    const pharmaceuticalRequestList = await createPharmaceuticalRequestList(req.body);

    if (!pharmaceuticalRequestList) {
      throw new ErrorHandler("Failed to create pharmaceutical request list", 400);
    }

    res.status(201).json(pharmaceuticalRequestList);
  }
);
// export const CreatewithoutIpdpermissionPharmaceuticalRequestListController = asyncHandler(
//   async (req, res) => {
//     const {
//       uniqueHealthIdentificationId,
//       requestForType,
//       billingType,
//       pharmacistUserId,
//       packages = [],
//     } = req.body;

//     if (!requestForType || !billingType || !pharmacistUserId) {
//       throw new ErrorHandler("All fields are required", 400);
//     }

//     const existUHID = await UHID.findById(uniqueHealthIdentificationId);
//     if (!existUHID) {
//       throw new ErrorHandler("UHID does not exist", 404);
//     }

//     // Validate each medicine's stock
//     for (const pkg of packages) {
//       const { medicineName, quantity } = pkg;

//       const medicine = await Medicine.findOne({ medicine_name: medicineName });

//       if (!medicine) {
//         throw new ErrorHandler(`Medicine '${medicineName}' not found`, 404);
//       }

//       if (medicine.stock === 0) {
//         throw new ErrorHandler(
//           `Medicine '${medicineName}' is out of stock. Cannot create request.`,
//           400
//         );
//       }

//       if (medicine.stock < quantity) {
//         throw new ErrorHandler(
//           `Requested quantity (${quantity}) for '${medicineName}' exceeds available stock (${medicine.stock})`,
//           400
//         );
//       }
//     }

//     // All medicines are valid and in stock
//     const pharmaceuticalRequestList = await createwithoutIPDpermissionPharmaceuticalRequestList(req.body);

//     if (!pharmaceuticalRequestList) {
//       throw new ErrorHandler("Failed to create pharmaceutical request list", 400);
//     }

//     res.status(201).json(pharmaceuticalRequestList);
//   }
// );

export const getAllPharmaceuticalRequestListController = asyncHandler(
  async (req, res) => {
    const pharmaceuticalRequestList = await getAllPharmaceuticalRequestList(
      req.queryOptions
    );

    if (!pharmaceuticalRequestList) {
      throw new ErrorHandler("Pharmaceutical request list not found", 404);
    }

    res.status(200).json(pharmaceuticalRequestList);
  }
);

export const getPharmaceuticalRequestListController = asyncHandler(
  async (req, res) => {
    const pharmaceuticalRequestList = await getPharmaceuticalRequestList(
      req.params.id
    );

    if (!pharmaceuticalRequestList) {
      throw new ErrorHandler("Pharmaceutical request list not found", 404);
    }

    res.status(200).json(pharmaceuticalRequestList);
  }
);

export const updatePharmaceuticalRequestListController = asyncHandler(
  async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ErrorHandler("No data provided for update", 400);
    }

    const pharmaceuticalRequestList = await updatePharmaceuticalRequestList(
      req.params.id,
      req.body
    );

    if (!pharmaceuticalRequestList) {
      throw new ErrorHandler("Pharmaceutical request list not found", 404);
    }

    res.status(200).json(pharmaceuticalRequestList);
  }
);

export const deletePharmaceuticalRequestListController = asyncHandler(
  async (req, res) => {
    const pharmaceuticalRequestList = await deletePharmaceuticalRequestList(
      req.params.id
    );

    if (!pharmaceuticalRequestList) {
      throw new ErrorHandler("Pharmaceutical request list not found", 404);
    }

    res
      .status(200)
      .json({ message: "Pharmaceutical request list deleted successfully" });
  }
);


export const getPharmaceuticalRequestByCaseController = asyncHandler(async (req, res) => {
  const { outpatientCaseId, inpatientCaseId } = req.query;

  console.log('📥 Request query params:', { outpatientCaseId, inpatientCaseId }); // Debug log

  // Validate that at least one case ID is provided
  if (!outpatientCaseId && !inpatientCaseId) {
    throw new ErrorHandler("Either outpatientCaseId or inpatientCaseId is required", 400);
  }

  // Validate ObjectIds
  if (outpatientCaseId && !mongoose.Types.ObjectId.isValid(outpatientCaseId)) {
    throw new ErrorHandler("Invalid outpatientCaseId", 400);
  }

  if (inpatientCaseId && !mongoose.Types.ObjectId.isValid(inpatientCaseId)) {
    throw new ErrorHandler("Invalid inpatientCaseId", 400);
  }

  try {
    const pharmaceuticalRequests = await getPharmaceuticalRequestByCase({
      outpatientCaseId,
      inpatientCaseId
    });

    console.log('📊 Found requests:', pharmaceuticalRequests.length); // Debug log

    res.status(200).json({
      success: true,
      count: pharmaceuticalRequests.length,
      data: pharmaceuticalRequests,
      message: pharmaceuticalRequests.length > 0 
        ? "Pharmaceutical requests retrieved successfully" 
        : "No pharmaceutical requests found for this case"
    });
  } catch (error) {
    console.error('❌ Controller error:', error);
    throw new ErrorHandler(
      `Failed to retrieve pharmaceutical requests: ${error.message}`, 
      500
    );
  }
});


// pharmacetucial request without ipd permssion

export const CreatewithoutIpdpermissionPharmaceuticalRequestListController = asyncHandler(
  async (req, res) => {
    const {
      uniqueHealthIdentificationId,
      requestForType,
      billingType,
      pharmacistUserId,
      packages = [],
    } = req.body;

    if (!requestForType || !billingType || !pharmacistUserId) {
      throw new ErrorHandler("All fields are required", 400);
    }

    const existUHID = await UHID.findById(uniqueHealthIdentificationId);
    if (!existUHID) {
      throw new ErrorHandler("UHID does not exist", 404);
    }

    // Validate each medicine's stock
    for (const pkg of packages) {
      const { medicineName, quantity } = pkg;

      const medicine = await Medicine.findOne({ medicine_name: medicineName });

      if (!medicine) {
        throw new ErrorHandler(`Medicine '${medicineName}' not found`, 404);
      }

      if (medicine.stock === 0) {
        throw new ErrorHandler(
          `Medicine '${medicineName}' is out of stock. Cannot create request.`,
          400
        );
      }

      if (medicine.stock < quantity) {
        throw new ErrorHandler(
          `Requested quantity (${quantity}) for '${medicineName}' exceeds available stock (${medicine.stock})`,
          400
        );
      }
    }

    // All medicines are valid and in stock
    const pharmaceuticalRequestList = await createwithoutIPDpermissionPharmaceuticalRequestList(req.body);

    if (!pharmaceuticalRequestList) {
      throw new ErrorHandler("Failed to create pharmaceutical request list", 400);
    }

    res.status(201).json(pharmaceuticalRequestList);
  }
);



export const getAllwithoutIPDpermissionPharmaceuticalRequestListController = asyncHandler(
  async (req, res) => {
    const pharmaceuticalRequestList = await getAllwithoutIPDpermissionPharmaceuticalRequestList(
      req.queryOptions
    );

    if (!pharmaceuticalRequestList) {
      throw new ErrorHandler("Pharmaceutical request list not found", 404);
    }

    res.status(200).json(pharmaceuticalRequestList);
  }
);


export const getwithoutIPDpermissionPharmaceuticalRequestListController = asyncHandler(
  async (req, res) => {
    const pharmaceuticalRequestList = await getwithoutIPDpermissionPharmaceuticalRequestList(
      req.params.id
    );

    if (!pharmaceuticalRequestList) {
      throw new ErrorHandler("Pharmaceutical request list not found", 404);
    }

    res.status(200).json(pharmaceuticalRequestList);
  }
);

export const updatewithoutIPDpermissionPharmaceuticalRequestListController = asyncHandler(
  async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ErrorHandler("No data provided for update", 400);
    }

    const pharmaceuticalRequestList = await updatewithoutIPDpermissionPharmaceuticalRequestList(
      req.params.id,
      req.body
    );

    if (!pharmaceuticalRequestList) {
      throw new ErrorHandler("Pharmaceutical request list not found", 404);
    }

    res.status(200).json(pharmaceuticalRequestList);
  }
);

export const deletewithoutIPDpermissionPharmaceuticalRequestListController = asyncHandler(
  async (req, res) => {
    const pharmaceuticalRequestList = await deletewithoutIPDpermissionPharmaceuticalRequestList(
      req.params.id
    );

    if (!pharmaceuticalRequestList) {
      throw new ErrorHandler("Pharmaceutical request list not found", 404);
    }

    res
      .status(200)
      .json({ message: "Pharmaceutical request list deleted successfully" });
  }
);

export const getwithoutIPDpermissionPharmaceuticalRequestByCaseController = asyncHandler(async (req, res) => {
  const { outpatientCaseId, inpatientCaseId } = req.query;

  console.log('📥 Request query params:', { outpatientCaseId, inpatientCaseId }); // Debug log

  // Validate that at least one case ID is provided
  if (!outpatientCaseId && !inpatientCaseId) {
    throw new ErrorHandler("Either outpatientCaseId or inpatientCaseId is required", 400);
  }

  // Validate ObjectIds
  if (outpatientCaseId && !mongoose.Types.ObjectId.isValid(outpatientCaseId)) {
    throw new ErrorHandler("Invalid outpatientCaseId", 400);
  }

  if (inpatientCaseId && !mongoose.Types.ObjectId.isValid(inpatientCaseId)) {
    throw new ErrorHandler("Invalid inpatientCaseId", 400);
  }

  try {
    const pharmaceuticalRequests = await getwithoutIPDpermissionPharmaceuticalRequestByCase({
      outpatientCaseId,
      inpatientCaseId
    });

    console.log('📊 Found requests:', pharmaceuticalRequests.length); // Debug log

    res.status(200).json({
      success: true,
      count: pharmaceuticalRequests.length,
      data: pharmaceuticalRequests,
      message: pharmaceuticalRequests.length > 0 
        ? "Pharmaceutical requests retrieved successfully" 
        : "No pharmaceutical requests found for this case"
    });
  } catch (error) {
    console.error('❌ Controller error:', error);
    throw new ErrorHandler(
      `Failed to retrieve pharmaceutical requests: ${error.message}`, 
      500
    );
  }
});