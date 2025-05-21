import { db } from "../libs/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    throw new ApiError(404, "User profile not found");
  }

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

  const profileDataToUpdate = {};

  Object.keys(req.body).forEach((key) => {
    if (req.body[key] !== undefined) {
      profileDataToUpdate[key] = req.body[key];
    }
  });

  if (Object.keys(profileDataToUpdate).length === 0) {
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

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "User profile updated successfully",
        updatedUserProfile,
      ),
    );
};

export { getProfile, updateProfile };
