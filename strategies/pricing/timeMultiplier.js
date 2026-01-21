const logger = require("../../core/lib/logger");
const { DatabaseError } = require("../../core/errors/errors");

class TimeMultiplier {
  constructor() {}

  calculate = (context) => {
    try {
      return context.duration * 0.8;
    } catch (error) {
      logger.error("Error in TimeMultiplier:calculate : ", error);
      throw new DatabaseError("Error in TimeMultiplier:calculate : ", error);
    }
  };
}

module.exports = TimeMultiplier;
