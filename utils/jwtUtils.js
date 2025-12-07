import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN_SECRET;
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      roles: user.role,
    },
    ACCESS_TOKEN,
    { expiresIn: '7d' }
  );
};

export const generateAccessTokenUser = (user) => {
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN_SECRET;
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      permission: user.permission,
      superAdmin: user.superAdmin === true, // add superAdmin flag
    },
    ACCESS_TOKEN,
    { expiresIn: '7d' }
  );
};

export const generateRefreshToken = (user) => {
  const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      superAdmin: user.superAdmin === true, // also add here if needed
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyAccessToken = (token) => {
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN_SECRET;
  return jwt.verify(token, ACCESS_TOKEN);
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

export function generateInviteCode(prefix = '') {
  const date = new Date();
  const postfix = String(date.getTime());
  const inviteCode = prefix.slice(0, 3);
  return `${inviteCode + postfix.slice(9, 13)}`;
}

// const token = generateInviteCode("digitalks");
// console.log(token);