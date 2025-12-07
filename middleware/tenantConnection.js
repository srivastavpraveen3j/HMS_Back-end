import tenantManager from "../utils/TenantConnectionManager.js";
import NamespaceAPI from "../utils/Namespace.js";

export const tenantConnectionMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) return res.status(401).json({ message: "API Key required" });

    const { dbURI } = await NamespaceAPI.getDBURIByApiKey(apiKey);

    // Get tenant connection
    const conn = await tenantManager.getConnection(apiKey, dbURI);

    // Attach connection and helper to request
    req.db = conn;
    req.getModel = (name, schema) => conn.model(name, schema);

    // Optional: Monkey patch mongoose.model for zero-change in existing controllers
    req.originalModel = require("mongoose").model.bind(require("mongoose"));
    require("mongoose").model = conn.model.bind(conn);

    next();
  } catch (err) {
    next(err);
  }
};
