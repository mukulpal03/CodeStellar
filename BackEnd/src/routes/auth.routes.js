import { Router } from "express";
import { asyncHandler } from "../utils/asynchandler.js";
import {
  changeCurrentPassword,
  forgotPasswordReq,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetPassword,
  verifyUser,
} from "../controllers/auth.controllers.js";
import {
  registerUserSchema,
  loginUserSchema,
  EmailSchema,
  passwordSchema,
  passwordChangeSchema,
} from "../validators/user.validators.js";
import { validateData } from "../middlewares/uservalidator.middleware.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/register")
  .post(validateData(registerUserSchema), asyncHandler(registerUser));

router.route("/verify/:token").post(asyncHandler(verifyUser));

router
  .route("/login")
  .post(validateData(loginUserSchema), asyncHandler(loginUser));

router.route("/logout").post(isLoggedIn, asyncHandler(logoutUser));

router.route("/refresh").post(asyncHandler(refreshAccessToken));

router
  .route("/resendVerifyMail")
  .post(isLoggedIn, asyncHandler(resendEmailVerification));

router
  .route("/forgot-password")
  .get(validateData(EmailSchema), asyncHandler(forgotPasswordReq));

router
  .route("/reset-password/:token")
  .post(validateData(passwordSchema), asyncHandler(resetPassword));

router
  .route("/change-password")
  .post(
    isLoggedIn,
    validateData(passwordChangeSchema),
    asyncHandler(changeCurrentPassword),
  );

export default router;
