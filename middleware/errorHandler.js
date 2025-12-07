const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Log for debugging (optional)
  console.error(`[Error]: ${message} (${statusCode})`);

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorMiddleware;