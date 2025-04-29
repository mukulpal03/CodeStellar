import { Router } from "express";
import { checkAdmin, isLoggedIn } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { createProblem } from "../controllers/problem.controllers.js";

const router = Router();

router.route("/").post(isLoggedIn, checkAdmin, asyncHandler(createProblem));

export default router;
