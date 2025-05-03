import jwt from "jsonwebtoken";

const generateAccessToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );
};

const generateRefreshToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );
};

export { generateAccessToken, generateRefreshToken };
