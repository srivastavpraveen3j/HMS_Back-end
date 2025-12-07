import {
  createSchedule,
  getSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  addException,
  removeException,
} from "../services/doctorSchedule.js";

// Create new schedule
export const createScheduleController = async (req, res) => {
  try {
    const schedule = await createSchedule(req.body);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all schedules (or by doctorId)
export const getSchedulesController = async (req, res) => {
  try {
    const { doctorId } = req.query;
    const schedules = await getSchedules(doctorId);
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get schedule by ID
export const getScheduleByIdController = async (req, res) => {
  try {
    const schedule = await getScheduleById(req.params.id);
    if (!schedule) return res.status(404).json({ error: "Schedule not found" });
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update schedule
export const updateScheduleController = async (req, res) => {
  try {
    const updated = await updateSchedule(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Schedule not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete schedule
export const deleteScheduleController = async (req, res) => {
  try {
    const deleted = await deleteSchedule(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Schedule not found" });
    res.status(200).json({ message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add exception
export const addExceptionController = async (req, res) => {
  try {
    const updated = await addException(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remove exception
export const removeExceptionController = async (req, res) => {
  try {
    const updated = await removeException(req.params.id, req.params.exceptionId);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
