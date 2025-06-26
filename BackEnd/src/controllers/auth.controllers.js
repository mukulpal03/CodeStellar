import { db } from "../libs/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
  sendMail,
  registerUserMailGenContent,
  resetPasswordMailGenContent,
} from "../utils/mail.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateAccessRefreshToken.service.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/env.js";

async function generateAccessAndRefreshToken(userId) {
  try {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken,
      },
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(400, "Error while generating access or refresh token");
  }
}

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  const token = crypto.randomBytes(32).toString("hex");

  const user = await db.user.create({
    data: {
      username,
      email,
      password,
      verificationToken: token,
      verificationTokenExpiry: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  if (!user) {
    throw new ApiError(500, "Error while registering the user");
  }

  await sendMail({
    email: user.email,
    subject: "Email Verification",
    mailGenContent: registerUserMailGenContent(
      user.name,
      `
      ${config.BASE_URL}/auth/verify/${token}
      `,
    ),
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user.id,
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .status(201)
    .json(
      new ApiResponse(201, "User registered successfully", {
        accessToken,
        refreshToken,
      }),
    );
};

const verifyUser = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    throw new ApiError(400, "Token is missing");
  }

  const user = await db.user.findFirst({
    where: {
      verificationToken: token,
    },
  });

  if (!user) {
    throw new ApiError(404, "Invalid verification token");
  }

  if (user.verificationTokenExpiry < new Date()) {
    throw new ApiError(400, "Verification token has expired");
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });

  res.status(200).json(new ApiResponse(200, "User verified successfully"));
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const userExists = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!userExists) {
    throw new ApiError(401, "Invalid email or password");
  }

  const matchPassword = await bcrypt.compare(password, userExists.password);

  if (!matchPassword) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    userExists.id,
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .status(201)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        username: userExists.username,
        email: userExists.email,
        accessToken,
        refreshToken
      }),
    );
};

const logoutUser = async (req, res) => {
  const id = req.user?.id;

  console.log(id);

  console.log("hello");

  const user = await db.user.update({
    where: {
      id,
    },
    omit: {
      password: true,
    },
    data: {
      refreshToken: null,
    },
  });

  if (!user) {
    throw new ApiError(500, "Error while logging out user");
  }

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, "User logged out successfully"));
};

const refreshAccessToken = async (req, res) => {
  const currRefreshToken = req.cookies?.refreshToken;

  if (!currRefreshToken) {
    throw new ApiError(403, "Refresh token has expired. Please log in again.");
  }

  const decoded = jwt.verify(currRefreshToken, config.REFRESH_TOKEN_SECRET);

  const user = await db.user.findFirst({
    where: {
      id: decoded.id,
    },
    omit: {
      password: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "No user found");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user.id,
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .status(200)
    .json(
      new ApiResponse(
        200,
        "New access and refresh token generated successfully",
        {
          accessToken,
          refreshToken,
        },
      ),
    );
};

const resendEmailVerification = async (req, res) => {
  const token = crypto.randomBytes(32).toString("hex");

  const user = await db.user.update({
    where: {
      id: req.user.id,
    },
    omit: {
      password: true,
      refreshToken: true,
    },
    data: {
      verificationToken: token,
      verificationTokenExpiry: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  if (!user) {
    throw new ApiError(500, "Error while generating token");
  }

  await sendMail({
    email: user.email,
    subject: "Email Verification",
    mailGenContent: registerUserMailGenContent(
      user.name,
      `
      ${config.BASE_URL}/auth/verify/${token}
      `,
    ),
  });

  res.status(200).json(new ApiResponse(200, "Mail sent successfully"));
};

const forgotPasswordReq = async (req, res) => {
  const { email } = req.body;

  const user = await db.user.findUnique({
    where: {
      email,
    },
    omit: {
      password: true,
      refreshToken: true,
    },
  });

  if (!user) {
    throw new ApiError(400, "Incorrect email");
  }

  const token = crypto.randomBytes(32).toString("hex");

  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      resetPasswordToken: token,
      resetPasswordExpiry: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  await sendMail({
    email: user.email,
    subject: "Password reset",
    mailGenContent: resetPasswordMailGenContent(
      user.name,
      `
      ${config.BASE_URL}/auth/reset-password/${token}
      `,
    ),
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Reset password mail sent successfully"));
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await db.user.findFirst({
    where: {
      resetPasswordToken: token,
    },
  });

  if (!user) {
    throw new ApiError(403, "Invalid token");
  }

  if (user.resetPasswordExpiry < new Date()) {
    throw new ApiError(400, "Token expired");
  }

  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      password,
      resetPasswordToken: null,
      resetPasswordExpiry: null,
    },
  });

  res.status(200).json(new ApiResponse(200, "Password reset successfully"));
};

const changeCurrentPassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  const user = await db.user.findFirst({
    where: {
      id: req.user.id,
    },
  });

  const matchPassword = await bcrypt.compare(currentPassword, user.password);

  if (!matchPassword) {
    throw new ApiError(401, "Current password is incorrect");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Confirm password doesn't match with new password");
  }

  const passwordChanged = await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: newPassword,
    },
  });

  if (!passwordChanged) {
    throw new ApiError(500, "Error while changing the password");
  }

  res.status(200).json(new ApiResponse(200, "Password changed successfully"));
};

export {
  registerUser,
  verifyUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  resendEmailVerification,
  forgotPasswordReq,
  resetPassword,
  changeCurrentPassword,
};
