const logger = require("../../core/lib/logger");
const { DatabaseError } = require("../../core/errors/errors");

class Surge {
  constructor() {}

  calculate = (context) => {
    try {
      return Math.random(1) * context.baseFare;
    } catch (error) {
      logger.error("Error in Surge:calculate : ", error);
      throw new DatabaseError("Error in Surge:calculate : ", error);
    }
  };
}

module.exports = Surge;
