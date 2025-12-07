import * as doctorService from "../services/doctorMaster.js";

export const createDoctor = async (req, res) => {
    try {
        const doctor = await doctorService.createDoctor(req.body);
        res.status(201).json({
            success: true,
            message: "Doctor created successfully",
            data: doctor,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getAllDoctors = async (req, res) => {
    try {
        const { search } = req.query;

        const doctors = await doctorService.getAllDoctors(search);

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const getDoctorById = async (req, res) => {
    try {
        const doctor = await doctorService.getDoctorById(req.params.id);
        res.status(200).json({
            success: true,
            data: doctor,
        });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

export const updateDoctor = async (req, res) => {
    try {
        const doctor = await doctorService.updateDoctor(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Doctor updated successfully",
            data: doctor,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc Delete doctor
 * @route DELETE /api/doctors/:id
 */
export const deleteDoctor = async (req, res) => {
    try {
        await doctorService.deleteDoctor(req.params.id);
        res.status(200).json({
            success: true,
            message: "Doctor deleted successfully",
        });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

/**
 * @desc Toggle doctor status (active/inactive)
 * @route PATCH /api/doctors/:id/status
 */
export const toggleDoctorStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        const doctor = await doctorService.toggleDoctorStatus(req.params.id, isActive);
        res.status(200).json({
            success: true,
            message: `Doctor marked as ${isActive ? "active" : "inactive"}`,
            data: doctor,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};