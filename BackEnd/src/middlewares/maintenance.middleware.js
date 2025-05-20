import config from "../config/env.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const maintenanceMode = (req, res, next) => {
  if (config.MAINTENANCE_MODE === "true") {
    return res
      .status(503)
      .json(
        new ApiResponse(503, "Server is under maintenance, Please try again later"),
      );
  }

  next();
};

export { maintenanceMode };
