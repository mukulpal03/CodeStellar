import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import healthCheckRoutes from "./routes/healthcheck.routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/v1/health", healthCheckRoutes);

export default app;
