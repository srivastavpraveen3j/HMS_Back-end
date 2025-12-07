// routes/logs.js
import express from "express";
import ActivityLog from "../models/ActivityLog.js";
import { Parser } from "json2csv";

const router = express.Router();

/**
 * GET /logs/all
 * Exports ONLY logs that contain response_time_ms as CSV
 */
router.get("/all", async (req, res) => {
    try {
        // Fetch only logs where response_time_ms exists
        const logs = await ActivityLog.find(
            { response_time_ms: { $exists: true, $ne: "" } }
        )
        .sort({ response_time_ms: -1 }) // sort slowest → fastest
        .lean();

        if (!logs.length) {
            return res.status(404).json({ message: "No logs found with response_time_ms" });
        }

        // Map logs into flat structure for CSV
        const records = logs.map(log => ({
            _id: log._id.toString(),
            tenant_id: log.tenant_id || "",
            hospital_id: log.hospital_id || "",
            user_id: log.user_id ? log.user_id.toString() : "",
            api_endpoint: log.api_endpoint || "",
            status_code: log.status_code || "",
            response_time_ms: log.response_time_ms || "",
            created_at: log.created_at ? log.created_at.toISOString() : ""
        }));

        // Define CSV fields
        const fields = [
            "_id",
            "tenant_id",
            "hospital_id",
            "user_id",
            "api_endpoint",
            "status_code",
            "response_time_ms",
            "created_at"
        ];

        // Convert to CSV
        const parser = new Parser({ fields });
        const csv = parser.parse(records);

        // CSV headers
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=api_logs_with_response_time.csv");

        return res.status(200).send(csv);
    } catch (error) {
        console.error("Error exporting logs:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
