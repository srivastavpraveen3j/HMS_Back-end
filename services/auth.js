import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwtUtils.js";
import bcrypt from "bcryptjs";

const login = async (user) => {

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid email or password");
  }

  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  // Optional: save refreshToken in DB

  return { user, token, refreshToken };
};

export default login;