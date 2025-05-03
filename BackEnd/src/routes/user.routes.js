import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asynchandler.js";
import {
  deleteProfile,
  getProfile,
  updateProfile,
} from "../controllers/user.controllers.js";

const router = Router();

router.use(isLoggedIn);

router
  .route("/")
  .get(asyncHandler(getProfile))
  .patch(asyncHandler(updateProfile))
  .delete(asyncHandler(deleteProfile));

export default router;
