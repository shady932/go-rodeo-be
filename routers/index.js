// const cacheRouter = require("./cache");
const ridesRouter = require("./rides");
const driversRouter = require("./drivers");
const tripsRouter = require("./trips");
const paymentsRouter = require("./payments");
const authMiddleware = require("../middlewares/auth");

const registerRoutes = (app) => {
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "OK.",
    });
  });
  //   app.use("/v1/cache", cacheRouter);
  app.use("/v1/rides", authMiddleware, ridesRouter);
  app.use("/v1/drivers", authMiddleware, driversRouter);
  app.use("/v1/trips", authMiddleware, tripsRouter);
  app.use("/v1/payments", authMiddleware, paymentsRouter);
};

module.exports = registerRoutes;
