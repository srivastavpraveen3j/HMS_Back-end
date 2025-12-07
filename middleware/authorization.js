const hasAllPermission = (permissions, action) => {
  const allPermission = permissions.find((p) => p.moduleName === "ALL");
  return allPermission && allPermission[action] === 1;
};

export const authorizePermission = (moduleName, action) => {
  return (req, res, next) => {
    const user = req.user?.toJSON?.() || req.user;
    const { role } = user;

    const userPermissions = role?.permission || [];

    if (hasAllPermission(userPermissions, action)) {
      return next();
    }

    const modulePermission = userPermissions.find(
      (p) => p.moduleName === moduleName
    );

    if (!modulePermission || modulePermission[action] !== 1) {
      return res.status(403).json({
        error: `Access denied. You don't have ${action} permission for ${moduleName}.`,
      });
    }

    next();
  };
};
