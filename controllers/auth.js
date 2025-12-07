// controllers/auth.js
import asyncWrapper from "../utils/asyncWrapper.js";
import User from "../models/user.js";
import Doctor from "../models/doctor.js";
import { verifyRefreshToken } from "../utils/jwtUtils.js";
import {
  generateAccessTokenUser,
  generateRefreshToken,
} from "../utils/jwtUtils.js";

import bcrypt from "bcryptjs";

export const loginController = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = await User.findOne({ email })
    .select("+password")
    .populate({
      path: "role",
      populate: {
        path: "permission",
      },
    });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: {
      _id: user.role?._id,
      name: user.role?.name,
    },
    permission: user.role?.permission?.map((p) => ({
      moduleName: p.moduleName,
      permissions: {
        read: p.read,
        create: p.create,
        update: p.update,
        delete: p.delete,
      },
    })),
  };

  const token = generateAccessTokenUser(safeUser);
  const refreshToken = generateRefreshToken(safeUser);

  return res.json({
    user: safeUser,
    token,
    refreshToken,
  });
});

// export const registerController = asyncWrapper(async (req, res) => {
//   const { name, email, password } = req.body;
//   const user = await User.create({ name, email, password });
//   const token = generateAccessTokenUser(user);
//   return res.status(201).json({ token });
// });

export const refreshTokenController = asyncWrapper(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res
      .status(401)
      .json({ success: false, message: "No refresh token" });
  }
  const payload = verifyRefreshToken(refreshToken);
  const user = await findUserById(payload.id);
  const newAccessToken = generateAccessTokenUser(user);
  const newRefreshToken = generateRefreshToken(user); // optional: rotate refresh token
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.status(200).json({ success: true, token: newAccessToken });
});


export const logoutController = asyncWrapper(async (req, res) => {
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 0,
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});
