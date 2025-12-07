import mongoose from "mongoose";

export const dynamicFilterMiddleware = (req, res, next) => {
    try {
        const filters = req.query; // Extract filters from query parameters
        const matchStage = {};

        // Build dynamic filters based on query params for UHID

        if (filters._id) {
            matchStage["_id"] = new mongoose.Types.ObjectId(filters._id); // Convert string to ObjectId
        }
        if (filters.patient_name) {
            matchStage["patient_name"] = { $regex: filters.patient_name, $options: 'i' };
        }
        if (filters.gender) {
            matchStage["gender"] = filters.gender;
        }
        if (filters.dob) {
            matchStage["dob"] = new Date(filters.dob); // Assuming dob is a Date field
        }
        if (filters.dot){
            matchStage["dot"] = filters.dot;
        }
        if (filters.age) {
            matchStage["age"] = parseInt(filters.age);
        }
        if (filters.mobile_no) {
            matchStage["mobile_no"] = { $regex: filters.mobile_no, $options: 'i' };
            console.log(matchStage);
        }
        if (filters.area) {
            matchStage["area"] = filters.area;
        }
        if (filters.pincode) {
            matchStage["pincode"] = parseInt(filters.pincode);
        }

        if (filters.uhid) {
            matchStage["uhid"] = filters.uhid;
        }

        if (filters.inpatientCaseId) {
          matchStage["inpatientCaseId"] = filters.inpatientCaseId;
        }

        // Store the filter in the request object for use in the next step
        req.queryOptions.matchStage = matchStage;
        // console.log(req.queryOptions);  // Log the filters for debugging
        next(); // Proceed to the next middleware or controller
    } catch (error) {
        res.status(500).json({ error: "Error in filter middleware: " + error.message });
    }
};
