import { Router } from "express";
import { asyncHandler } from "../utils/asynchandler.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { getSubmissionById, getSubmissions } from "../controllers/submission.controllers.js";

const router = Router();

router.route("/").get(isLoggedIn, asyncHandler(getSubmissions));

router.route("/:id").get(isLoggedIn, asyncHandler(getSubmissionById));

export default router;