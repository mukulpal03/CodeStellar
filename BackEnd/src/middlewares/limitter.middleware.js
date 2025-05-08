import { rateLimit } from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: new ApiError(429, "Too many attempts. Please try again later.")
});

export { authLimiter };
