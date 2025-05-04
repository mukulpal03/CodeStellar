import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asynchandler.js";
import {
  deleteProfile,
  getProfile,
  updateProfile,
} from "../controllers/user.controllers.js";
import { validateData } from "../middlewares/uservalidator.middleware.js";
import { updateProfileSchema } from "../validators/user.validators.js";

const router = Router();

router.use(isLoggedIn);

router
  .route("/")
  .get(asyncHandler(getProfile))
  .patch(validateData(updateProfileSchema), asyncHandler(updateProfile))
  .delete(asyncHandler(deleteProfile));

export default router;
