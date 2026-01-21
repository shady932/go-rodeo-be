const redis = require("redis");
const logger = require("../core/lib/logger");

const redisURL = "redis://127.0.0.1:6379";

const redisClient = redis.createClient({
  url: redisURL,
});

redisClient.on("error", (err) => logger.info("Redis Client Error", err));

(async function () {
  await redisClient.connect();
  logger.info("Redis clients connected");
})();

module.exports = redisClient;
