import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { executeCode } from "../controllers/execute-code.controllers.js";

const router = Router();

router.route("/").post(isLoggedIn, asyncHandler(executeCode))

export default router;
