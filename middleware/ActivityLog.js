import ActivityLog from '../models/ActivityLog.js';  // Adjust the path

const activityLogMiddleware = async (req, res, next) => {
  try {
    // Capture start time when request enters
    const startHrTime = process.hrtime();

    // When response is finished
    res.on("finish", async () => {
      try {
        // Calculate response time in ms
        const diff = process.hrtime(startHrTime);
        const response_time = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2);

        // Extract user if available
        const user = req.user;

        // Extract tenant_id and hospital_id from headers
        const tenant_id = req.headers['x-hims-api'];
        const hospital_id = req.headers['x-groupd-key'];

        // Construct endpoint (method + URL)
        const api_endpoint = `${req.method} ${req.originalUrl}`;

        // Other request info
        const ip_address = req.ip;
        const user_agent = req.headers['user-agent'];

        // Save to DB
        await ActivityLog.create({
          tenant_id,
          hospital_id,
          user_id: user?._id || null,
          api_endpoint,
          description: 'API request logged',
          ip_address,
          user_agent,
          response_time_ms:response_time,
          created_at: new Date()
        });
      } catch (err) {
        console.error("Error saving activity log:", err);
      }
    });

    next();
  } catch (error) {
    console.error("Error in activity middleware:", error);
    next();
  }
};

export default activityLogMiddleware;
