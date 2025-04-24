import { db } from "../libs/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return next(new ApiError(400, "User with this email already exists"));
  }

  const user = await db.user.create({
    data: {
      name,
      email,
      password,
    },
  });

  if (!user) {
    return next(new ApiError(500, "Error while registering the user"));
  }

  res.status(201).json(new ApiResponse(201, "User registered successfully"));
};

export { registerUser };
