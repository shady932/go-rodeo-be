const logger = require("../../core/lib/logger");
const { DatabaseError } = require("../../core/errors/errors");

class DistanceMultiplier {
  constructor() {}

  calculate = (context) => {
    try {
      return context.distance * 0.6;
    } catch (error) {
      logger.error("Error in DistanceMultiplier:calculate : ", error);
      throw new DatabaseError(
        "Error in DistanceMultiplier:calculate : ",
        error
      );
    }
  };
}

module.exports = DistanceMultiplier;
