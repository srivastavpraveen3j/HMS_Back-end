import { verifyAccessToken } from "../utils/jwtUtils.js";
import CustomError from "../utils/CustomError.js";
import User from "../models/user.js"; // Adjust path based on your project structure

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return next(new CustomError("Authentication token required", 401));
  }

  try {
    const decoded = verifyAccessToken(token); // { id: userId, ... }
    // Fetch user from database using decoded ID
    const authUser = await User.findById(decoded.id).populate({
      path: "role",
      populate: {
        path: "permission",
      },
    });
    // convert authUser  to json and print to console
    console.log(authUser.toJSON());

    if (!authUser) {
      return next(new CustomError("User not found", 404));
    }
    console.log(authUser);
    req.user = authUser; // Attach full user object to the request
    next();
  } catch (error) {
    return next(new CustomError(error, 401));
  }
};