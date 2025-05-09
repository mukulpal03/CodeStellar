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
import { authLimiter } from "../middlewares/limitter.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/register")
  .post(
    authLimiter,
    upload.single("avatar"),
    validateData(registerUserSchema),
    asyncHandler(registerUser),
  );

router.route("/verify/:token").post(authLimiter, asyncHandler(verifyUser));

router
  .route("/login")
  .post(authLimiter, validateData(loginUserSchema), asyncHandler(loginUser));

router.route("/logout").post(isLoggedIn, asyncHandler(logoutUser));

router.route("/refresh").post(asyncHandler(refreshAccessToken));

router
  .route("/resendVerifyMail")
  .post(isLoggedIn, asyncHandler(resendEmailVerification));

router
  .route("/forgot-password")
  .get(authLimiter, validateData(EmailSchema), asyncHandler(forgotPasswordReq));

router
  .route("/reset-password/:token")
  .post(authLimiter, validateData(passwordSchema), asyncHandler(resetPassword));

router
  .route("/change-password")
  .post(
    isLoggedIn,
    validateData(passwordChangeSchema),
    asyncHandler(changeCurrentPassword),
  );

export default router;
