const { DatabaseError } = require("../../core/errors/errors");
const logger = require("../../core/lib/logger");

class BaseFare {
  constructor() {}

  calculate = (context) => {
    try {
      return context.baseFare;
    } catch (error) {
      logger.error("Error in BaseFare:calculate : ", error);
      throw new DatabaseError("Error in BaseFare:calculate : ", error);
    }
  };
}

module.exports = BaseFare;
