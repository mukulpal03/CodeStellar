import dotenv from "dotenv";
dotenv.config();

const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT) || 4000,
  HOST: process.env.HOST || "localhost",
  DATABASE_URL: process.env.DATABASE_URL,
  BASE_URL:
    process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`,
  MAINTENANCE_MODE: process.env.MAINTENANCE_MODE === "true",
  ORIGIN_URL: process.env.ORIGIN_URL || "http://localhost:5173",

  // Mailtrap
  MAILTRAP_HOST: process.env.MAILTRAP_HOST,
  MAILTRAP_PORT: parseInt(process.env.MAILTRAP_PORT) || 2525,
  MAILTRAP_USER: process.env.MAILTRAP_USER,
  MAILTRAP_PASSWORD: process.env.MAILTRAP_PASSWORD,
  MAILTRAP_SENDER_MAIL:
    process.env.MAILTRAP_SENDER_MAIL || "noreply@codestellar.com",

  // JWT
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "7d",

  // Judge0
  JUDGE0_API_URI: process.env.JUDGE0_API_URI,

  // Cloudinary
  CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

export default config;
