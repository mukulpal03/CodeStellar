import { Router } from "express";
import { asyncHandler } from "../utils/asynchandler.js";
import {
  changeCurrentPassword,
  forgotPasswordReq,
  getProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetPassword,
  verifyUser,
} from "../controllers/auth.controllers.js";
import {
  validateRegisterUser,
  validateLoginUser,
  validateEmail,
  validatePassword,
  validatePasswordChange,
} from "../middlewares/uservalidator.middleware.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/register")
  .post(validateRegisterUser, asyncHandler(registerUser));

router.route("/verify/:token").post(asyncHandler(verifyUser));

router.route("/login").post(validateLoginUser, asyncHandler(loginUser));

router.route("/logout").post(isLoggedIn, asyncHandler(logoutUser));

router.route("/refresh").post(asyncHandler(refreshAccessToken));

router.route("/profile").get(isLoggedIn, asyncHandler(getProfile));

router
  .route("/resendVerifyMail")
  .post(isLoggedIn, asyncHandler(resendEmailVerification));

router
  .route("/forgot-password")
  .get(validateEmail, asyncHandler(forgotPasswordReq));

router
  .route("/reset-password/:token")
  .post(validatePassword, asyncHandler(resetPassword));

router
  .route("/change-password")
  .post(
    isLoggedIn,
    validatePasswordChange,
    asyncHandler(changeCurrentPassword),
  );

export default router;
