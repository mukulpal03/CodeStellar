import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import healthCheckRoutes from "./routes/healthcheck.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import executionRoutes from "./routes/execute-code.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import sheetRoutes from "./routes/sheet.routes.js";
import { maintenanceMode } from "./middlewares/maintenance.middleware.js";
import { limitter } from "./middlewares/limitter.middleware.js";
import { ApiError } from "./utils/ApiError.js";
import config from "./config/env.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: config.ORIGIN_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(helmet());
app.use(maintenanceMode);
app.use(limitter);

app.use("/api/v1/health", healthCheckRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code", executionRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/v1/sheets", sheetRoutes);

app.use((req, _res, next) => {
  next(new ApiError(404, `Not Found - ${req.originalUrl}`));
});

app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    statusCode,
    message: err.message || "Internal server error",
    errors: err.errors || [],
    success: false,
  });
});

export default app;
