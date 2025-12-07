import PlatformUser from '../models/PlatformUser.js';
import bcrypt from 'bcryptjs';
import CustomError from '../utils/CustomError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwtUtils.js';
import asyncWrapper from '../utils/asyncWrapper.js';

export const invitePlaformUser = async ({ name, email, inviteToken,role }) => {
  const existingUser = await PlatformUser.findOne({ email });

  if (existingUser) {
      throw new CustomError("User Already Exist", 200);
  }

  return await PlatformUser.create({
    name,
    email,
    token:inviteToken,
    role,
    status: 'pending'
  });
};

export const activateAdminUser = async ({ token, password }) => {
  const user = await PlatformUser.findOneAndUpdate(
    { token: token, status: 'pending' },
    {
      password: await bcrypt.hash(password, 10),
      token: undefined,
      status: 'active'
    },
    { new: true }
  );

  if (!user) {
    throw new CustomError("User Not Found", 200);
  }

  return user;
};

export const loginPlatformUser = asyncWrapper(async ({ email, password }) => {
  const user = await PlatformUser.findOne({ email, status: 'active' });

  if (!user) {
    throw new CustomError("User Not Found", 200);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new CustomError("Invalid password", 200);
  }

  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, token, refreshToken };
});

export const getAllPlatformUsers = async () => {
  return PlatformUser.find();
};

export const updateUserAccess = async (userId, { roleIds = [], permissionIds = [] }) => {
  const user = await PlatformUser.findByIdAndUpdate(
    userId,
    { roles: roleIds, permissions: permissionIds },
    { new: true }
  );

  if (!user) throw new Error('User not found');

  return user;
};

export const updateUserRolesPermissions = async (userId, updates) => {
  const { roles, permissions } = updates;

  const user = await PlatformUser.findByIdAndUpdate(
    userId,
    { $set: { roles, permissions } },
    { new: true }
  );

  if (!user) throw new Error('User not found');

  return user;
};

export const getAllUsers = async () => {
  return PlatformUser.find({}, '-password');
};

