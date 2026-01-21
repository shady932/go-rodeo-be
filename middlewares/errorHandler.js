const { status: httpStatus } = require("http-status");
const ApiResponse = require("../core/lib/response");
const errorHandler = require("../core/errors/error-handler");
const logger = require("../core/lib/logger");

const errorMiddleware = (err, req, res, next) => {
  const errorContext = [];
  const request = req || {};
  errorContext.push(`method: ${request.method}`);
  errorContext.push(`url: ${request.originalUrl}`);
  errorContext.push(`body: ${JSON.stringify(request.body)}`);
  errorContext.push(`status: ${(err || {}).status}`);
  errorContext.push(`user: ${(request.user || {}).id}`);

  const errContextMessage = errorContext.join(" | ");

  if (errContextMessage && !errContextMessage.includes("/auth")) {
    logger.error(`[error context:] - ${errContextMessage}`);
  }

  if (!errorHandler.isTrustedError(err)) {
    // Forward to uncaughtException global error handler
    next(err);
    return;
  }

  errorHandler.handleError(err);

  const errorResponse = new ApiResponse({
    success: err.isOverrideSuccess || false,
    data: {
      process: err.isPublic || false,
    },
    message: err.message ? err.message : "Something went wrong.",
    status: err.status || httpStatus.INTERNAL_SERVER_ERROR,
    errors: err.data || [],
  });

  res.status(err.status).json(errorResponse);
};

module.exports = errorMiddleware;
