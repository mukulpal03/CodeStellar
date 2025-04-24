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
      verificationTokenExpiry: new Date(Date.now() + 10 * 60 * 1000)
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

export { registerUser };
