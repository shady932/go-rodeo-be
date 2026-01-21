const logger = require("../lib/logger");
const errorHandler = require("./error-handler");

process.on("unhandledRejection", (reason, promise) => {
  logger.error("unhandled promise rejection occurred.", reason);
  throw reason;
});

process.on("uncaughtException", async (error) => {
  logger.error("uncaught exception occured");
  errorHandler.handleError(error);
  if (!errorHandler.isTrustedError(error)) {
    const errorMsg = JSON.stringify({ error });
    await notifyCrash(errorMsg);
    await gracefulShutdown();
  }
});

const notifyCrash = async (errorMsg) => {
  try {
    logger.error("Application crashed unexpectedly.", errorMsg);
  } catch (e) {
    logger.error("Crash notification failed. ", e);
  }
};

const gracefulShutdown = async () => {
  // TODO: close any resource dependency here:
  process.exit(1);
};
