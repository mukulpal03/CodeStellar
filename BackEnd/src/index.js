import app from "./app.js";
import config from "./config/env.js";
import logger from "./config/logger.js";

const PORT = config.PORT;

app.listen(PORT, () => {
  logger.info(
    `Server listening on ${config.BASE_URL} in ${config.NODE_ENV} mode`,
  );

  if (config.MAINTENANCE_MODE) {
    logger.warn("Application is currently in MAINTENANCE MODE.");
  }
});
