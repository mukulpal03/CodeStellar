import winston from "winston";
import config from "./env.js";

const errorFormat = winston.format((info) => {
  if (info instanceof Error) {
    const statusCode = info.statusCode ? ` [${info.statusCode}]` : "";
    return Object.assign({}, info, {
      message: `${info.message}${statusCode}\n${info.stack}`,
    });
  }
  return info;
});

const level =
  config.LOG_LEVEL || (config.NODE_ENV === "development" ? "debug" : "info");

const logger = winston.createLogger({
  level: level,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errorFormat(),
    winston.format.splat(),
    config.NODE_ENV === "development"
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    }),
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error"],
    }),

    // --- Production-Ready File Logging (Optional for now, but good to know) ---
    // In a production environment, you'd typically add file transports.
    // You can uncomment and configure these when you're ready for deployment.
    /*
    new winston.transports.File({
      filename: 'logs/error.log', // All 'error' level logs will go here
      level: 'error',
      maxsize: 5242880, // 5MB per file
      maxFiles: 5,      // Keep up to 5 rotated files
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json() // Log errors in JSON format to file for easier parsing
      )
    }),
    new winston.transports.File({
      filename: 'logs/combined.log', // All logs (based on the main 'level') will go here
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json() // Log all levels in JSON format to this file
      )
    })
    */
  ],
});

if (config.NODE_ENV === "development") {
  logger.debug(`Winston logger initialized. Logging level set to: '${level}'.`);
}

export default logger;
