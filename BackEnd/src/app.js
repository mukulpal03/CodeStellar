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

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(helmet());
app.use(maintenanceMode);

app.use("/api/v1/health", healthCheckRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code", executionRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/v1/sheets", sheetRoutes);

app.use((_req, res) => {
  res.status(404).json({
    message: "Page not found",
    success: false,
  });
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
