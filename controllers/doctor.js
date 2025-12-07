import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import Doctor from "../models/doctor.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import bcrypt from "bcryptjs";

import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deactivateDoctor,
  activateDoctor,
  deleteDoctor,
  searchDoctors,
} from "../services/doctor.js";

import { parseCSVWithHeaders } from "../utils/parseCSVWithHeaders.js";
import { createUser } from "../services/User.js";
// Create a new doctor
export const createDoctorHandler = asyncHandler(async (req, res) => {
  const {
    name,
    mobile_no,
    address,
    dob,
    sign,
    dr_type,
    type,
    reg_no,
    degree,
    speciality,
    specialization,
    qualifications,
    experience,
    pan_no,
    email,
  } = req.body;

  // if (
  //   !name ||
  //   !mobile_no ||
  //   !address ||
  //   !dob ||
  //   !sign ||
  //   !dr_type ||
  //   !type ||
  //   !reg_no ||
  //   !degree ||
  //   !speciality ||
  //   !specialization ||
  //   !qualifications ||
  //   !experience ||
  //   !pan_no ||
  //   !email
  // ) {
  //   throw new ErrorHandler("All fields are required", 400);
  // }

  const existingDoctor = await Doctor.findOne({ name });
  if (existingDoctor) {
    throw new ErrorHandler("Doctor with this email already exists", 409);
  }

  // await createUser({
  //   email,
  //   password: req.body.password,
  //   role: req.body.role,
  // });

  const newDoctor = await createDoctor(req.body);
    
  if (!newDoctor) {
   throw new ErrorHandler("Failed to create doctor", 500);
  }

  res.status(201).json({
    success: true,
    data: newDoctor,
  });
});

// Get all doctors (with lean to avoid BSON errors)
export const getAllDoctorsHandler = asyncHandler(async (req, res) => {
  const pageData = res.paginatedResults;

  if (!pageData) {
    throw new ErrorHandler("Doctors not found", 404);
  }

  res.status(200).json({
    success: true,
    data: pageData,
  });
});

// Get doctor by ID
export const getDoctorByIdHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doctor = await getDoctorById(id);

  if (!doctor) {
    throw new ErrorHandler("Doctor not found", 404);
  }

  res.status(200).json({
    success: true,
    data: doctor,
  });
});

// Update doctor by ID
export const updateDoctorHandler = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No data provided to update", 400);
  }

  const { id } = req.params;
  const updateData = req.body;
  const updatedDoctor = await updateDoctor(id, updateData);

  if (!updatedDoctor) {
    throw new ErrorHandler("Failed to update doctor or not found", 404);
  }

  res.status(200).json({
    success: true,
    data: updatedDoctor,
  });
});

// Deactivate doctor by ID
export const deactivateDoctorHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doctor = await deactivateDoctor(id);

  if (!doctor) {
    throw new ErrorHandler("Doctor not found", 404);
  }

  res.status(200).json({
    success: true,
    data: doctor,
  });
});

// Activate doctor by ID
export const activateDoctorHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const doctor = await activateDoctor(id);

  if (!doctor) {
    throw new ErrorHandler("Doctor not found", 404);
  }

  res.status(200).json({
    success: true,
    data: doctor,
  });
});

// Delete doctor by ID
export const deleteDoctorHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  if (!id) {
    throw new ErrorHandler("Please provide a valid doctor ID", 404);
  }

  const deletedDoctor = await deleteDoctor(id);
  if (!deletedDoctor) {
    throw new ErrorHandler("Doctor not found with the given ID", 404);
  }

  res.status(200).json({
    success: true,
    message: "Doctor deleted successfully",
  });
});

// Search doctors by query
export const searchDoctorsHandler = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    throw new ErrorHandler("Please provide a search query", 400);
  }

  const results = await searchDoctors(q);

  res.status(200).json({
    success: true,
    data: results,
  });
});

// Helper function to parse CSV string
// const parseCSVWithHeaders = (csvString) => {
//   const result = Papa.parse(csvString, {
//     header: true,
//     skipEmptyLines: true,
//   });

//   if (result.errors.length) {
//     throw new Error(`CSV Parsing Error: ${result.errors[0].message}`);
//   }

//   const headers = result.meta.fields;
//   const rows = result.data;

//   return { headers, rows };
// };

// Controller
export const uploadDoctors = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const fileContent = req.file.buffer.toString("utf-8");

    const { headers, rows } = parseCSVWithHeaders(fileContent);

    const expectedHeaders = Object.keys(Doctor.schema.paths).filter(
      (key) => !["_id", "__v"].includes(key)
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

    // Optional: Log headers and preview first row
    // console.log('CSV Headers:', headers);
    console.log("First Row Preview:", rows);

    // Do something with the parsed data
    const results = await Promise.all(
      rows.map(async (row) => {
        try {
          const result = await createDoctor(row);
          return result;
        } catch (error) {
          console.error("Error creating doctor:", error.message);
          return null;
        }
      })
    ).then((results) => results.filter((result) => result !== null));

    console.log("Created Doctors:", results);

    // You could also validate required fields or filter inactive ones here

    return res.status(200).json({
      message: "CSV file parsed successfully",
      headers,
      totalRecords: rows.length,
      sample: results, // return first 3 rows as preview
    });
  } catch (error) {
    console.error("Upload Doctors Error:", error.message);
    return res.status(500).json({ message: error.message });
  }
});

import {
  generateAccessTokenUser,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtUtils.js";

// 🧑‍⚕️ Doctor Login
export const doctorLoginController = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required." });

  const doctor = await Doctor.findOne({ email }).select("+password");
  if (!doctor || !(await bcrypt.compare(password, doctor.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const safeDoctor = {
    _id: doctor._id,
    name: doctor.name,
    email: doctor.email,
    specialization: doctor.specialization,
    role: "doctor",
  };

  const token = generateAccessTokenUser(safeDoctor);
  const refreshToken = generateRefreshToken(safeDoctor);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({ user: safeDoctor, token, refreshToken });
});

// 👨‍⚕️ Doctor Registration (Optional)
export const doctorRegisterController = asyncWrapper(async (req, res) => {
  const {
    name,
    email,
    password,
    specialization,
    licenseNo,
    department,
    experience,
  } = req.body;

  const doctor = await Doctor.create({
    name,
    email,
    password,
    specialization,
    licenseNo,
    department,
    experience,
  });

  const token = generateAccessTokenUser({ _id: doctor._id, name: doctor.name, email: doctor.email, role: "doctor" });
  const refreshToken = generateRefreshToken({ _id: doctor._id, name: doctor.name, email: doctor.email, role: "doctor" });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({ user: doctor, token, refreshToken });
});

// 🔄 Refresh Token
export const doctorRefreshTokenController = asyncWrapper(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token found" });
  }

  const payload = verifyRefreshToken(refreshToken);
  const doctor = await Doctor.findById(payload._id);
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });

  const safeDoctor = {
    _id: doctor._id,
    name: doctor.name,
    email: doctor.email,
    specialization: doctor.specialization,
    role: "doctor",
  };

  const newAccessToken = generateAccessTokenUser(safeDoctor);
  const newRefreshToken = generateRefreshToken(safeDoctor);

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({ token: newAccessToken });
});

// 🚪 Logout
export const doctorLogoutController = asyncWrapper(async (req, res) => {
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 0,
  });
  res.status(200).json({ message: "Doctor logged out successfully" });
});
