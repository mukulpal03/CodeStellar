import { db } from "../libs/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getProfile = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "No profile found");
  }

  res.status(200).json(new ApiResponse(200, `Welcome, ${user.name}`, user));
};

const updateProfile = async (req, res) => {
  const user = req.user;

  const updatedUser = await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      ...req.body,
    },
  });

  if (!updatedUser) {
    throw new ApiError(500, "Error while updating user");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "User updated successfully", updatedUser));
};

const deleteProfile = async (req, res) => {
  const user = req.user;

  const deletedUser = await db.user.delete({
    where: {
      id: user.id,
    },
  });

  if (!deletedUser) {
    throw new ApiError(500, "Error while deleting user");
  }

  res.status(200).json(new ApiResponse(200, "User deleted successfully"));
};

export { getProfile, updateProfile, deleteProfile };
