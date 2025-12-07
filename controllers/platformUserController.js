import asyncWrapper from "../utils/asyncWrapper.js";
import CustomError from "../utils/CustomError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateInviteCode,
} from "../utils/jwtUtils.js";
import PlatformUser from "../models/PlatformUser.js";
import NameSpace from "../models/NameSpace.js";
import {
  invitePlaformUser,
  activateAdminUser,
  getAllPlatformUsers,
  updateUserAccess,
  updateUserRolesPermissions,
} from "../services/platformUserService.js";

import bcrypt from "bcryptjs";
import eventBus from "../libs/EventBusQueue.js"; // ✅ use event system

// Invite user
export const inviteUserController = asyncWrapper(async (req, res, next) => {
  const { name, email, role } = req.body;
  const inviteToken = generateInviteCode(name);

  if (typeof inviteToken !== "string") {
    throw new CustomError("Internal Server Error", 500);
  }

  const user = await invitePlaformUser({ name, email, inviteToken, role });

  eventBus.emit("user.invited", { email, name, inviteToken });
  res.status(201).json({ success: true, message: "Invitation sent.", user });
});

// Activate account
export const activateUserController = asyncWrapper(async (req, res) => {
  const { token, password } = req.body;
  const userEmail = await PlatformUser.findOne({ token });

  if (!userEmail) {
    throw new CustomError("User Not Found", 404);
  }

  const user = await activateAdminUser({ token, password });

  // ✅ Emit event
  eventBus.emit("user.activated", { user, password });

  res.status(200).json({ success: true, message: "Account activated.", user });
});

// Login
export const loginUserController = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;
  const user = await PlatformUser.findOne({ email, status: "active" })
    .populate({
      path: "role",
      populate: {
        path: "PlatformPermission", // Assuming 'permissions' is a reference in the 'role'
        model: "PlatformPermission", // The model name for the permissions
      },
    }).populate({
      path: "namespaceId",
      populate: {
        path: "subscriptions",   // array of ObjectIds
        model: "Subscription",
      },
    });

  if (!user) {
    throw new CustomError("User Not Found", 404);
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new CustomError("Invalid Credentials", 401);
  }

  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // ✅ Emit login event
  eventBus.emit("user.logged_in", { user });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ success: true, token, refreshToken, user });
});

// Get all platform users
export const getAllPlatformUsersController = asyncWrapper(async (req, res) => {
  const users = await getAllPlatformUsers();

  // ✅ Emit read event
  eventBus.emit("user.listed", { count: users.length, requestedBy: req.user?._id });

  res.status(200).json({ success: true, users });
});

// Update user access
export const updateUserAccessController = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const { roleIds, permissionIds } = req.body;
  const updatedUser = await updateUserAccess(userId, { roleIds, permissionIds });

  // ✅ Emit access update event
  eventBus.emit("user.access_updated", { userId, roleIds, permissionIds });

  res.status(200).json({ success: true, user: updatedUser });
});

// Refresh token
export const refreshTokenController = asyncWrapper(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "No refresh token" });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await findUserById(payload.id);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ Emit refresh event
    eventBus.emit("user.token_refreshed", { userId: user._id });

    return res.status(200).json({ success: true, token: newAccessToken });
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid refresh token" });
  }
});

// Update roles & permissions
export const updateUserRolesPermissionsController = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const { roles, permissions } = req.body;
  const updatedUser = await updateUserRolesPermissions(userId, { roles, permissions });

  // ✅ Emit role update event
  eventBus.emit("user.roles_permissions_updated", { userId, roles, permissions });

  res.status(200).json({ success: true, user: updatedUser });
});
