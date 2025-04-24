import { Router } from "express";
import { asyncHandler } from "../utils/asynchandler.js";
import { registerUser } from "../controllers/auth.controllers.js";

const router = Router();

router.route("/register").post(asyncHandler(registerUser));

export default router;
