import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";

const isLoggedIn = async (req, _res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return next(new ApiError(401, "Unauthorized access"));
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await db.user.findFirst({
      where: {
        id: decoded.id,
      },
      omit: {
        password: true,
        refreshToken: true,
        verificationToken: true,
        verificationTokenExpiry: true,
        resetPasswordToken: true,
        resetPasswordExpiry: true,
      },
    });

    if (!user) {
      return next(new ApiError(401, "Unauthorized access"));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(401, error?.message || "Invalid access token"));
  }
};

const checkAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });

    if (!user || user.role !== "ADMIN") {
      return next(new ApiError(403, "You do not have permission"));
    }

    next();
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Error checking admin role"));
  }
};

export { isLoggedIn, checkAdmin };
