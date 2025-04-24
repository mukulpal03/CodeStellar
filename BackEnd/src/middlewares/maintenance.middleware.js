import { apiResponse } from "../utils/ApiResponse.js";

const maintenanceMode = (req, res, next) => {
  if (process.env.MAINTENANCE_MODE) {
    res
      .status(503)
      .json(
        apiResponse(503, "Server is under maintenance, Please try again later"),
      );
  }

  next();
};

export { maintenanceMode };
