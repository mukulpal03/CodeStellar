import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import db from "../libs/db.js";

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
        password: false,
        refreshToken: false,
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

export { isLoggedIn };
