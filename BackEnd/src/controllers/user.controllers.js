import { db } from "../libs/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import logger from "../config/logger.js";

const getProfile = async (req, res) => {
  const userId = req.user?.id;

  const userProfile = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
      profile: {
        select: {
          fullName: true,
          bio: true,
          avatar: true,
          country: true,
          githubURL: true,
          linkedinURL: true,
          websiteURL: true,
        },
      },
    },
  });

  if (!userProfile) {
    logger.error(`User profile not found for ID: ${userId}`);
    throw new ApiError(404, "User profile not found");
  }

  logger.info(
    `Profile successfully retrieved for user: ${userProfile.username}`,
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, "User profile retrieved successfully", userProfile),
    );
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { fullName, bio, avatar, country, githubURL, linkedinURL, websiteURL } =
    req.body;

  logger.debug(
    `Attempting to update profile for user ID: ${userId} with data:`,
    req.body,
  );

  const profileDataToUpdate = {};

  Object.keys(req.body).forEach((key) => {
    if (req.body[key] !== undefined) {
      profileDataToUpdate[key] = req.body[key];
    }
  });

  if (Object.keys(profileDataToUpdate).length === 0) {
    logger.info(`No data provided to update profile for user ID: ${userId}`);
    throw new ApiError(400, "No data provided to update profile.");
  }

  const updatedUserProfile = await prisma.userProfile.upsert({
    where: { userId: userId },
    update: profileDataToUpdate,
    create: {
      userId: userId,
      ...profileDataToUpdate,
    },
    select: {
      fullName: true,
      bio: true,
      avatar: true,
      country: true,
      githubURL: true,
      linkedinURL: true,
      websiteURL: true,
      updatedAt: true,
    },
  });

  logger.info(`Profile updated successfully for user ID: ${userId}`);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUserProfile,
        "User profile updated successfully",
      ),
    );
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
