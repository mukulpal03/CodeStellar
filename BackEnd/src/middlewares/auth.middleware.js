import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import config from "../config/env.js";

const isLoggedIn = async (req, _res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!accessToken) {
    throw new ApiError(401, "Unauthorized request: No token provided");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET);
  } catch (error) {
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
      throw new ApiError(401, "Invalid access token: User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(
        new ApiError(
          401,
          error?.message || "Invalid access token due to an unexpected issue.",
        ),
      );
    }
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user || !req.user.role) {
      throw new ApiError(
        403,
        "Forbidden: User role not available for authorization.",
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Forbidden: Your role (${req.user.role}) is not authorized to access this resource.`,
      );
    }

    next();
  };
};

export { isLoggedIn, authorizeRoles };
