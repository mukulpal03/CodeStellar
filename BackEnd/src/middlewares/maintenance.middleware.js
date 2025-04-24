import { ApiResponse } from "../utils/ApiResponse.js";

const maintenanceMode = (req, res, next) => {
  if (process.env.MAINTENANCE_MODE === "true") {
    return res
      .status(503)
      .json(
        new ApiResponse(503, "Server is under maintenance, Please try again later"),
      );
  }

  next();
};

export { maintenanceMode };
