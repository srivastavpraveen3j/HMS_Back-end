import mongoose from "mongoose";

export const dynamicUserFilterMiddleware = (req, res, next) => {
  try {
    req.queryOptions = req.queryOptions || {};
    const filters = req.query;
    const matchStage = {};

    // ID filter
    if (filters._id) {
      matchStage["_id"] = new mongoose.Types.ObjectId(filters._id);
    }

    // Basic user details
    if (filters.name) {
      matchStage["name"] = { $regex: filters.name, $options: "i" };
    }
    if (filters.email) {
      matchStage["email"] = { $regex: filters.email, $options: "i" };
    }
    if (filters.mobile_no) {
      matchStage["mobile_no"] = { $regex: filters.mobile_no, $options: "i" };
    }

    // Role-based filtering (doctors, admin, etc.)
    if (filters.role) {
      matchStage["role"] = filters.role;
    }

    // Boolean filter
    if (filters.isActive !== undefined) {
      matchStage["isActive"] = filters.isActive === "true";
    }

    // Date filters
    if (filters.created_at) {
      const createdAtDate = new Date(filters.created_at);
      if (!isNaN(createdAtDate)) matchStage["created_at"] = createdAtDate;
    }
      if (filters.updated_at) {
        const updatedAtDate = new Date(filters.updated_at);
        if (!isNaN(updatedAtDate)) matchStage["updated_at"] = updatedAtDate;
      }

    req.queryOptions.matchStage = matchStage;
    next();
  } catch (error) {
    console.error("Error in User filter middleware:", error);
    res
      .status(500)
      .json({ error: "Filter middleware failed: " + error.message });
  }
};
