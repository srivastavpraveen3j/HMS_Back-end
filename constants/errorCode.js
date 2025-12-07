const errorCodeMessages = {
  SUCCESS: {
    code: 200,
    message: "Request successful.",
  },
  BAD_REQUEST: {
    code: 400,
    message: "Bad request. Please check your input.",
  },
  UNAUTHORIZED: {
    code: 401,
    message: "Unauthorized access. Please log in.",
  },
  FORBIDDEN: {
    code: 403,
    message: "Forbidden. You don't have permission to access this resource.",
  },
  NOT_FOUND: {
    code: 404,
    message: "Resource not found.",
  },
  VALIDATION_ERROR: {
    code: 422,
    message: "Validation failed. Please correct the data.",
  },
  CONFLICT: {
    code: 409,
    message: "Conflict. The resource already exists.",
  },
  SERVER_ERROR: {
    code: 500,
    message: "Internal server error. Please try again later.",
  },

  // Custom application-specific errors
  DB_CONNECTION_FAILED: {
    code: 503,
    message: "Database connection failed.",
  },
  MISSING_FIELDS: {
    code: 400,
    message: "Missing required fields.",
  },
  INVALID_CREDENTIALS: {
    code: 401,
    message: "Invalid username or password.",
  },
  ACCESS_DENIED: {
    code: 403,
    message: "Access denied for this operation.",
  },
  SESSION_EXPIRED: {
    code: 440,
    message: "Session expired. Please log in again.",
  },
  TOKEN_EXPIRED: {
    code: 498,
    message: "Token has expired.",
  },
  TOKEN_INVALID: {
    code: 499,
    message: "Invalid authentication token.",
  }
};

export default errorCodeMessages;
