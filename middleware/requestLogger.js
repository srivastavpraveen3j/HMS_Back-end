const recentRequests = [];

export const requestLogger = (req, res, next) => {
  const log = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    time: new Date().toISOString()
  };

  recentRequests.unshift(log);
  if (recentRequests.length > 100) {
    recentRequests.pop(); // Keep only last 100
  }

  next();
};

export const getRecentRequests = () => recentRequests;