import User from "../models/user.js";
import CustomError from "../utils/CustomError.js";
import bcrypt from "bcryptjs";
import stringSimilarity from "string-similarity";

// Create a new user
export const createUser = async (payload) => {
  const existingUser = await User.findOne({ email: payload.email });

  if (existingUser) {
    throw new CustomError("User already exists", 400);
  }

  const salt = await bcrypt.genSalt(10);
  payload.password = await bcrypt.hash(payload.password, salt);

  const user = await User.create(payload);
  return user;
};

// Get all users
export const getUsers = async (search) => {
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } }, // case-insensitive
    ];
  }

  const users = await User.find(query).populate({
    path: "role",
    populate: { path: "permission" },
  });

  if (!users || users.length === 0) {
    throw new CustomError("No users found", 404);
  }

  return users;
};


// Get a single user by ID
export const getUserById = async (id) => {
  const user = await User.findById(id).populate({
    path: "role",
    populate: { path: "permission" },
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }
  return user;
};

// export const getAllUsers = async () => {
//   const users = await User.find().populate({
//     path: "role",
//     populate: { path: "permission" },
//   });
//   return users;
// };

// ✅ NEW: Get users by name (partial match)
export const getUsersByName = async (name) => {
  const users = await User.find({
    name: {
      $regex: name,
      $options: 'i' // Case-insensitive search
    }
  }).populate({
    path: "role",
    populate: { path: "permission" },
  });
  return users;
};

// Existing functions remain the same
export const getAllUsers = async () => {
  const users = await User.find().populate({
    path: "role",
    populate: { path: "permission" },
  });
  return users;
};

export const searchUser = async (filter = {}, name = "") => {
  // Fetch initial list (filtered by role if present)
  const users = await User.find(filter).lean();

  if (!name) return users;

  // Apply fuzzy matching for name
  const threshold = 0.4; // similarity between 0 (no match) and 1 (perfect)
  const fuzzyMatched = users.filter((u) => {
    const similarity = stringSimilarity.compareTwoStrings(
      u.name.toLowerCase(),
      name.toLowerCase()
    );
    return similarity >= threshold;
  });

  return fuzzyMatched;
};

// Update a user by ID
export const updateUser = async (id, updateData) => {
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  if (updateData.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(updateData.password, salt);
  }

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
  }).select("+password");

  return user;
};

// Delete a user by ID
export const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new CustomError("User not found", 404);
  }
  return user;
};

export const getUserByEmail = async (email) => {
  const user = await User.findOne({ email }).populate({
    path: "role",
    populate: { path: "permission" },
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }
  return user;
};

export const getUserByPhone = async (phone) => {
  const user = await User.findOne({ phone }).populate({
    path: "role",
    populate: { path: "permission" },
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }
  return user;
};

export const getUserByRole = async (role) => {
  const user = await User.findOne({ role }).populate({
    path: "role",
    populate: { path: "permission" },
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }
  return user;
};

export const getUserByStatus = async (status) => {
  const user = await User.findOne({ status }).populate({
    path: "role",
    populate: { path: "permission" },
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }
  return user;
};

export const getUserByRoleAndStatus = async (role, status) => {
  const user = await User.findOne({ role, status }).populate({
    path: "role",
    populate: { path: "permission" },
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }
  return user;
};

export const getUserByEmailAndPassword = async (email, password) => {
  const user = await User.findOne({ email }).populate({
    path: "role",
    populate: { path: "permission" },
  });

  if (!user) {
    throw new CustomError("Invalid Credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new CustomError("Invalid Credentials", 401);
  }

  return user;
};
