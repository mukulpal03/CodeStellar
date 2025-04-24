import { db } from "../libs/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { sendMail, registerUserMailGenContent } from "../utils/mail.js";
import crypto from "crypto";

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

  res.status(201).json(new ApiResponse(201, "User registered successfully"));
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

export { registerUser, verifyUser };
