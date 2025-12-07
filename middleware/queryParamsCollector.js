/**
 * Collects pagination options only from query params.
 * Attaches to `req.queryOptions` for use in controller or service.
 */
export const paginationCollector = () => (req, res, next) => {
  // Pagination parameters
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  // Clone query and remove pagination fields
  const query = { ...req.query };
  delete query.page;
  delete query.limit;

  // Collect all parameters except page and limit
  const collectedParams = {
    query,           // Filtered query params
    body: req.body,
    route: req.params
  };

  // Attach to request object
  req.queryOptions = {
    page,
    limit,
    params: collectedParams
  };

  next();
};