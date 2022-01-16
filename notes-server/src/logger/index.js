const { createLogger, format, transports } = require("winston");
const { timestamp, colorize, printf, errors, padLevels, label } = format;
const { Console } = transports;
const path = require("path");
const { getNamespace } = require("cls-hooked");
const contextPassing = getNamespace("context-passing");
/**
 * Logger to print errors and info in the console
 * @example 1: winstonLogger.logger.error("Patient couldn't be updated", new Error('Some database error')); // prints custom message with error stack
 * @example 2: winstonLogger.logger.error(new Error('Some database error')); // prints just error stack
 * @example 3: winstonLogger.logger.error("Patient couldn't be updated"); // Just prints the error message
 * @example 4: winstonLogger.logger.info('SBAR sent to users'); // info messages
 */
const logger = createLogger({
  transports: [new Console()],
  format: format.combine(
    errors({ stack: true }),
    timestamp(),
    label({ label: path.basename(process.mainModule.filename) }),
    padLevels(),
    printf((data) => {
      let { level, message, timestamp: dataTimestamp, stack } = data;

      if (stack) {
        const errorMessage =
          data[Symbol.for("splat")] &&
          data[Symbol.for("splat")][0] &&
          data[Symbol.for("splat")][0].message;

        message = errorMessage ? data.message.replace(errorMessage, "") : "-";

        return `${level} ${dataTimestamp}  ${
          contextPassing.get("sessionID") || "-"
        } ${message.trim()} ${stack}`;
      }
      return `${level} ${dataTimestamp}  ${
        contextPassing.get("sessionID") || "-"
      } ${message.trim()}`;
    })
  ),
  exitOnError: false, // do not exit on exceptions
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
});

if (process.env.env === "test") {
  logger.silent = true;
}

exports.logger = logger;
