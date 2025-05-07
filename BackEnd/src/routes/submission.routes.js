import { Router } from "express";
import { asyncHandler } from "../utils/asynchandler.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import {
  getSubmissionById,
  getSubmissions,
  getSubmissionsForProblem,
} from "../controllers/submission.controllers.js";

const router = Router();

router.route("/").get(isLoggedIn, asyncHandler(getSubmissions));

router.route("/:id").get(isLoggedIn, asyncHandler(getSubmissionById));

router
  .route("/:problemId")
  .get(isLoggedIn, asyncHandler(getSubmissionsForProblem));

export default router;
