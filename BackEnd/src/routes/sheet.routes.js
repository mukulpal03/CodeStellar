import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asynchandler.js";
import {
  addProblemToSheet,
  createSheet,
  deleteSheet,
  getSheetById,
  getSheets,
  removeProblem,
  updateSheet,
} from "../controllers/sheet.controllers.js";

const router = Router();

router
  .route("/")
  .get(isLoggedIn, asyncHandler(getSheets))
  .post(isLoggedIn, asyncHandler(createSheet));

router
  .route("/:id")
  .get(isLoggedIn, asyncHandler(getSheetById))
  .patch(isLoggedIn, asyncHandler(updateSheet))
  .delete(isLoggedIn, asyncHandler(deleteSheet));

router
  .route("/:id/:problemId")
  .post(isLoggedIn, asyncHandler(addProblemToSheet))
  .delete(isLoggedIn, asyncHandler(removeProblem));

export default router;
