import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getProfile = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "No profile found");
  }

  res.status(200).json(new ApiResponse(200, `Welcome, ${user.name}`, user));
};

const updateProfile = async (req, res, next) => {};

const deleteProfile = async (req, res, next) => {};

export { getProfile, updateProfile, deleteProfile };
