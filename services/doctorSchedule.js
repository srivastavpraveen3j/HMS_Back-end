import DoctorAppointmentScheduleMaster from "../models/DoctorAppointmentScheduleMaster.js";

// Create new schedule
export const createSchedule = async (data) => {
  const schedule = new DoctorAppointmentScheduleMaster(data);
  return await schedule.save();
};

// Get all schedules (optionally filter by doctor)
export const getSchedules = async (doctorId = null) => {
  const filter = doctorId ? { doctor: doctorId } : {};
  return await DoctorAppointmentScheduleMaster.find(filter).populate("doctor");
};

// Get schedule by ID
export const getScheduleById = async (id) => {
  return await DoctorAppointmentScheduleMaster.findById(id).populate("doctor");
};

// Update schedule
export const updateSchedule = async (id, data) => {
  return await DoctorAppointmentScheduleMaster.findByIdAndUpdate(id, data, {
    new: true,
  });
};

// Delete schedule
export const deleteSchedule = async (id) => {
  return await DoctorAppointmentScheduleMaster.findByIdAndDelete(id);
};

// Add exception (holiday / leave)
export const addException = async (scheduleId, exceptionData) => {
  const schedule = await DoctorAppointmentScheduleMaster.findById(scheduleId);
  if (!schedule) throw new Error("Schedule not found");

  schedule.exceptions.push(exceptionData);
  return await schedule.save();
};

// Remove exception
export const removeException = async (scheduleId, exceptionId) => {
  const schedule = await DoctorAppointmentScheduleMaster.findById(scheduleId);
  if (!schedule) throw new Error("Schedule not found");

  schedule.exceptions = schedule.exceptions.filter(
    (ex) => ex._id.toString() !== exceptionId
  );

  return await schedule.save();
};
