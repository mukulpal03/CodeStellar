import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";

const isLoggedIn = async (req, _res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      throw new ApiError(401, "Unauthorized access");
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await db.user.findFirst({
      where: {
        id: decoded.id,
      },
      select: {
        role: true,
      },
    });

    if (!user) {
      throw new ApiError(401, "Unauthorized access");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
};

const checkAdmin = async (req, _res, next) => {
  try {
    const user = req.user;

    if (!user || user.role !== "ADMIN") {
      throw new ApiError(403, "You do not have permission");
    }

    next();
  } catch (error) {
    throw new ApiError(500, "Error checking admin role");
  }
};

export { isLoggedIn, checkAdmin };
