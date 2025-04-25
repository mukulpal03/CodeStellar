import { db } from "../libs/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { sendMail, registerUserMailGenContent } from "../utils/mail.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/generateAccessRefreshToken.service.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

async function generateAccessAndRefreshToken(userId) {
  try {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

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

  const token = crypto.randomBytes(32).toString("hex");

  const user = await db.user.create({
    data: {
      name,
      email,
      password,
      verificationToken: token,
      verificationTokenExpiry: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  if (!user) {
    return next(new ApiError(500, "Error while registering the user"));
  }

  await sendMail({
    email: user.email,
    subject: "Email Verification",
    mailGenContent: registerUserMailGenContent(
      user.name,
      `
      ${process.env.BASE_URL}/auth/verify/${token}
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

const verifyUser = async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return next(new ApiError(400, "Token is missing"));
  }

  const user = await db.user.findFirst({
    where: {
      verificationToken: token,
    },
  });

  if (!user) {
    return next(new ApiError(404, "Invalid verification token"));
  }

  if (user.isVerified) {
    return res.status(200).json({ message: "User already verified" });
  }

  if (user.verificationTokenExpiry < new Date()) {
    return next(new ApiError(400, "Verification token has expired"));
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
    },
  });

  res.status(200).json(new ApiResponse(200, "User verified successfully"));
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  const userExists = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!userExists) {
    return next(new ApiError(401, "Invalid email or password"));
  }

  const matchPassword = await bcrypt.compare(password, userExists.password);

  if (!matchPassword) {
    return next(new ApiError(401, "Invalid email or password"));
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
        accessToken,
        refreshToken,
      }),
    );
};

const logoutUser = async (req, res, next) => {
  const id = req.user?.id;

  const user = await db.user.update({
    where: {
      id,
    },
    omit: {
      password: false,
    },
    data: {
      refreshToken: null,
    },
  });

  if (!user) {
    return next(new ApiError(500, "Error while logging out user"));
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

const refreshAccessToken = async (req, res, next) => {
  const currRefreshToken = req.cookies?.refreshToken;

  if (!currRefreshToken) {
    return next(
      new ApiError(403, "Refresh token has expired. Please log in again."),
    );
  }

  const decoded = jwt.verify(
    currRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );

  const user = await db.user.findFirst({
    where: {
      id: decoded.id,
    },
    omit: {
      password: true,
    },
  });

  if (!user) {
    return next(new ApiError(404, "No user found"));
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

const getProfile = async (req, res, next) => {
  const id = req.user?.id;

  const user = await db.user.findFirst({
    where: {
      id,
    },
    omit: {
      password: false,
      refreshToken: false,
    },
  });

  res.status(200).json(new ApiResponse(200, `Welcome ${user.name}`, user));
};

const resendEmailVerification = async (req, res, next) => {
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
    return next(new ApiError(500, "Error while generating token"));
  }

  await sendMail({
    email: user.email,
    subject: "Email Verification",
    mailGenContent: registerUserMailGenContent(
      user.name,
      `
      ${process.env.BASE_URL}/auth/verify/${token}
      `,
    ),
  });

  res.status(200).json(new ApiResponse(200, "Mail sent successfully"));
};

export {
  registerUser,
  verifyUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getProfile,
  resendEmailVerification,
};
