export const authorize = (allowedRoles = [], permissions = []) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const role = req.user.role;
    const roleName = role?.name;
    const rolePermissions = role?.permissions || [];

    // Super Admin bypass (dynamic)
    if (role?.isSuperAdmin) {
      return next();
    }

    // Role check
    if (allowedRoles.length && !allowedRoles.includes(roleName)) {
      return res.status(403).json({ message: "Forbidden: Role not allowed" });
    }

    // Permission check
    if (permissions.length && !rolePermissions.some(p => permissions.includes(p))) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};