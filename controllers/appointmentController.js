import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentByUhid,
} from "../services/appointmentService.js";
import Appointment from "../models/appointmentSchema.js";
import { sendEmail } from "../utils/sendMail.js";


export const createAppointmentController = asyncHandler(async (req, res) => {
  const {
    uhid,
    Consulting_Doctor,
    remarks,
    date,
    time,
    status,
    patient_name,
    payment_status,
    queue_status,
    time_slot,
    checkin_time,
    consultation_start,
    consultation_end,
    source,
    platform_name,
    staffId,
    staff_name,
    doctor_name,
    is_followup,
    followup_for,
    notes,
    emailAddress,
  } = req.body;

  const payload = {
    uhid,
    Consulting_Doctor,
    remarks,
    date,
    time,
    status,
    patient_name,
    payment_status,
    queue_status,
    time_slot,
    checkin_time,
    consultation_start,
    consultation_end,
    source,
    platform_name,
    staffId,
    staff_name,
    doctor_name,
    is_followup,
    followup_for,
    notes,
    emailAddress,
  };

  // const existingAppointment = await getAppointmentByUhid(uhid);

  // const filteredAppointments = existingAppointment.filter(
  //   (appointment) => appointment.time === payload.time
  // );
  // const consultingDoctorId =
  //   filteredAppointments[0]?.Consulting_Doctor.toString();

  // if (
  //   filteredAppointments.length >= 1 &&
  //   consultingDoctorId === Consulting_Doctor
  // ) {
  //   throw new ErrorHandler(
  //     "An appointment already exists for this doctor on this date and time",
  //     400
  //   );
  // }

  // console.log(
  //   `Consulting_Doctor: ${Consulting_Doctor}, Filtered Appointments: `,
  //   JSON.stringify(filteredAppointments[0], null, 2)
  // );

  const existingAppointment = await Appointment.findOne({
    Consulting_Doctor,
    date: new Date(date),
    time,
  });

  if (existingAppointment) {
    return res.status(400).json({
      success: false,
      message: "This doctor already has an appointment at the selected time.",
    });
  }

  const newAppointment = await createAppointment(payload);
  await newAppointment.populate(["Consulting_Doctor", "uhid"]);

  if (!newAppointment) {
    throw new ErrorHandler("Failed to create appointment", 500);
  }

  const templateVars = {
    tokenNumber: newAppointment.token_number || "N/A",
    patientName: newAppointment.patient_name || "System",
    doctorName: newAppointment.Consulting_Doctor?.name || "Procurement",
    date: new Date(newAppointment.date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: new Date(`1970-01-01T${newAppointment.time}`).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    ),
    checkInTime: new Date(newAppointment.checkin_time).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    ),
    phoneNumber: newAppointment.uhid?.mobile_no || "N/A",
    status: newAppointment.status || "N/A",
    emailAddress: newAppointment.emailAddress || "N/A",
    timeSlot: newAppointment.time_slot || "N/A",
  };

  let emailStatus = "not sent";
  try {
    await sendEmail(
      templateVars.emailAddress,
      "appointment_created",
      templateVars
    );
    await sendEmail(newAppointment.Consulting_Doctor?.email, "doctor_notification", templateVars);
    emailStatus = "sent";
  } catch (err) {
    console.error("❌ Email failed:", err.message);
    emailStatus = "failed";
  }

  res.status(201).json({
    success: true,
    message: "Appointment created successfully. Email process completed.",
    data: newAppointment,
    emailStatus,
  });
});

// Controller for getting all appointments with pagination
export const getAllAppointmentsController = asyncHandler(async (req, res) => {
  const result = await getAllAppointments(req.queryOptions);

  if (!result || result.length === 0) {
    throw new ErrorHandler("No appointments found", 404);
  }

  res.status(200).json({
    success: true,
    data: result,
  });
});

// Controller for getting an appointment by ID
export const getAppointmentByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const appointment = await getAppointmentById(id);

  if (!appointment) {
    throw new ErrorHandler("Appointment not found", 404);
  }

  res.status(200).json({
    success: true,
    data: appointment,
  });
});

// Controller for updating an appointment by ID
export const updateAppointmentController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No data provided for update", 400);
  }

  const appointment = await updateAppointment(req.params.id, req.body);

  if (!appointment) {
    throw new ErrorHandler("Appointment not found", 404);
  }

  res.status(200).json({
    success: true,
    data: appointment,
  });
});

// Controller for deleting an appointment by ID
export const deleteAppointmentController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appointment = await deleteAppointment(id);

  if (!appointment) {
    throw new ErrorHandler("Appointment failed to delete or not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Appointment deleted successfully",
  });
});
