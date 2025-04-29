import { Router } from "express";
import { checkAdmin, isLoggedIn } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asynchandler.js";
import {
  createProblem,
  getAllProblems,
  getProblemById,
} from "../controllers/problem.controllers.js";

const router = Router();

router
  .route("/")
  .get(isLoggedIn, asyncHandler(getAllProblems))
  .post(isLoggedIn, checkAdmin, asyncHandler(createProblem));

router.route("/:id").get(isLoggedIn, asyncHandler(getProblemById));

export default router;
