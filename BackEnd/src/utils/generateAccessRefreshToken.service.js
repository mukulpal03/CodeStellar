import jwt from "jsonwebtoken";
import config from "../config/env.js";

const generateAccessToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role,
    },
    config.ACCESS_TOKEN_SECRET,
    { expiresIn: config.ACCESS_TOKEN_EXPIRY },
  );
};

const generateRefreshToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role,
    },
    config.REFRESH_TOKEN_SECRET,
    { expiresIn: config.REFRESH_TOKEN_EXPIRY },
  );
};

export { generateAccessToken, generateRefreshToken };
