const logger = require("../core/lib/logger");
const { DatabaseError } = require("../core/errors/errors");

class Currency {
  constructor() {
    this.rate = {
      INR: 1,
      USD: 0.011,
    };
  }

  convert = ({ userCurrency, baseValue }) => {
    try {
      return baseValue * this.rate[userCurrency];
    } catch (error) {
      logger.error("Error in converting currency: ", error);
      throw new DatabaseError("Error in converting currency: ", error);
    }
  };
}

module.exports = Currency;
