import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersByName,
  searchUser
} from "../services/User.js";

import { getRole } from "../services/role.js";

export const createUserController = asyncHandler(async (req, res, next) => {
  const user = await createUser(req.body);
  res.status(201).json(user);
});

// export const getAllUsersController = asyncHandler(async (req, res, next) => {
//   const { id } = req.query;
//   if(id){
//     const user = await getUserById(id);
//     if (!user) {
//       return next(new ErrorHandler("User not found", 404));
//     }
//     res.status(200).json(user);
//     return 0;
//   }
//   const users = await getAllUsers();
//   if (!users) {
//     return next(new ErrorHandler("Users not found", 404));
//   }
//   res.status(200).json(users);
// });

// export const getUserByIdController = asyncHandler(async (req, res, next) => {
//   const { id } = req.query;
//   const user = await getUserById(id);
//   if (!user) {
//     return next(new ErrorHandler("User not found", 404));
//   }
//   res.status(200).json(user);
// });
export const getAllUsersController = asyncHandler(async (req, res, next) => {
  const { id, name } = req.query;

  // Search by ID
  if (id) {
    const user = await getUserById(id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    res.status(200).json(user);
    return;
  }

  // ✅ NEW: Search by name
  if (name) {
    const users = await getUsersByName(name);
    if (!users || users.length === 0) {
      return next(new ErrorHandler("No users found with that name", 404));
    }
    res.status(200).json(users);
    return;
  }

  // Get all users
  const users = await getAllUsers();
  if (!users) {
    return next(new ErrorHandler("Users not found", 404));
  }
  res.status(200).json(users);
});

export const updateUserController = asyncHandler(async (req, res, next) => {
  const user = await updateUser(req.params.id, req.body);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json(user);
});

export const deleteUserController = asyncHandler(async (req, res, next) => {
  const user = await deleteUser(req.params.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json(user);
});


export const searchUserController = asyncHandler(async (req, res, next) => {
  const { name, role } = req.query;

  const filter = {};


  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }

  if (role) {
    const roleData = await getRole(role);

    if (!roleData) {
      return next(new ErrorHandler("Invalid Role", 400));
    }

    filter.role = roleData[0]._id;
  }

  const users = await searchUser(filter);

  if (!users || users.length === 0) {
    return next(new ErrorHandler("No users found", 404));
  }

  res.status(200).json(users);
});
