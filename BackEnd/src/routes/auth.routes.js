import { Router } from "express";
import { asyncHandler } from "../utils/asynchandler.js";
import {
  getProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  verifyUser,
} from "../controllers/auth.controllers.js";
import {
  validateRegisterUser,
  validateLoginUser,
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

router.route("/resendVerifyMail").post(isLoggedIn, asyncHandler(resendEmailVerification))

export default router;
