import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";
import config from "../config/env.js";
import logger from "../config/logger.js";

const isLoggedIn = async (req, _res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization").replace("Bearer ", "");

  if (!accessToken) {
    logger.warn("Access token missing, authorization denied.");
    throw new ApiError(401, "Unauthorized request: No token provided");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
  } catch (error) {
    logger.warn(`JWT verification failed: ${error.message}`);
    if (error.name === "TokenExpiredError") {
      throw new ApiError(
        401,
        "Access token expired. Please refresh your token.",
      );
    }
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid access token.");
    }
    throw new ApiError(401, "Invalid access token.");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decodedToken?.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isVerified: true,
      },
    });

    if (!user) {
      logger.warn(`User not found for token ID: ${decodedToken?.id}.`);
      throw new ApiError(401, "Invalid access token: User not found");
    }

    req.user = user;
    logger.debug(
      `User ${user.username} (ID: ${user.id}) authenticated successfully.`,
    );
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      logger.error("Unexpected error in verifyJWT middleware:", error);
      next(
        new ApiError(
          401,
          error?.message || "Invalid access token due to an unexpected issue.",
        ),
      );
    }
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user || !req.user.role) {
      logger.warn(
        "Role authorization failed: req.user or req.user.role not set. verifyJWT might not have run or user has no role.",
      );
      throw new ApiError(
        403,
        "Forbidden: User role not available for authorization.",
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        `User ${req.user.username} (Role: ${
          req.user.role
        }) attempted to access a resource restricted to roles: ${allowedRoles.join(
          ", ",
        )}`,
      );
      throw new ApiError(
        403,
        `Forbidden: Your role (${req.user.role}) is not authorized to access this resource.`,
      );
    }

    next();
  };
};

export { isLoggedIn, authorizeRoles };
