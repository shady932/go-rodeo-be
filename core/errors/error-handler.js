const logger = require("../lib/logger");
const { BaseError } = require("./base-error");

/**
 * ErrorHandler
 */
class ErrorHandler {
  handleError = (err) => {
    logger.error(err);
    // TODO: notify or sentry
  };

  isTrustedError = (error) => {
    return error instanceof BaseError && error.isOperational;
  };
}

module.exports = new ErrorHandler();
