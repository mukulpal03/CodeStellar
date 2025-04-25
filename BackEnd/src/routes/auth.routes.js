import { Router } from "express";
import { asyncHandler } from "../utils/asynchandler.js";
import {
  loginUser,
  logoutUser,
  registerUser,
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

export default router;
