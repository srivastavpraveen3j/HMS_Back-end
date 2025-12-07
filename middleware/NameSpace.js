import Namespace from "../models/NameSpace.js";
import CustomError from "../utils/CustomError.js";

const publicRoutes = ["/v1/platform/login",
  "/v1/platform/activate/",
  "/v1/platform/invite",
  "/api/v1/platform/login",
  "/api/v1/platform/activate",
  "/api/v1/platform/invite"];

export const getNamespaceByApiKey = async (req, res, next) => {
  try {
    if (publicRoutes.includes(req.path)) {
      return next();
    }

    const api_Key = req.header("x-hims-api");
    if (!api_Key) {
      throw new CustomError("Missing x-hims-api header", 401);
    }

    const namespace = await Namespace.findOne({ api_Key });
    if (!namespace) {
      throw new CustomError("Invalid API Key", 403);
    }

    req.namespace = namespace;
    next();
  } catch (err) {
    next(err);
  }
};
