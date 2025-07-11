import { Router } from "express";
import { authorizeRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asynchandler.js";
import {
  createProblem,
  deleteProblem,
  getAllProblems,
  getProblemBySlugForUser,
  getSolvedProblems,
  updateProblem,
} from "../controllers/problem.controllers.js";

const router = Router();

router
  .route("/")
  .get(isLoggedIn, asyncHandler(getAllProblems))
  .post(isLoggedIn, authorizeRoles("ADMIN"), asyncHandler(createProblem));

router
  .route("/:id")
  .patch(isLoggedIn, authorizeRoles("ADMIN"), asyncHandler(updateProblem))
  .delete(isLoggedIn, authorizeRoles("ADMIN"), asyncHandler(deleteProblem));

router.route("/:slug").get(isLoggedIn, asyncHandler(getProblemBySlugForUser));

router.route("/solved").get(isLoggedIn, asyncHandler(getSolvedProblems));

export default router;
