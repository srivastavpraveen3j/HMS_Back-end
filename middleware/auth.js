import { verifyAccessToken } from '../utils/jwtUtils.js';
import CustomError from '../utils/CustomError.js';
import platformUser from '../models/PlatformUser.js'; // Adjust path based on your project structure

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return next(new CustomError('Authentication token required', 401));
  }

  try {
    const decoded = verifyAccessToken(token); // { id: userId, ... }

    // Fetch user from database using decoded ID
    const user = await platformUser.findById(decoded.id);

    if (!user) {
      return next(new CustomError('User not found', 404));
    }

    req.user = user; // Attach full user object to the request
    next();
  } catch (error) {
    return next(new CustomError(error, 401));
  }
};
