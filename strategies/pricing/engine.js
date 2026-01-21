const BaseStratergy = require("./baseFare");
const SurgeStratergy = require("./surge");
const TimeStratergy = require("./timeMultiplier");
const DistanceStratergy = require("./distanceMultiplier");

class PricingEngine {
  constructor() {
    this.strategies = {
      BASE: new BaseStratergy(),
      TIME: new TimeStratergy(),
      DIST: new DistanceStratergy(),
      SRGE: new SurgeStratergy(),
      //    "discount"":,
    };
  }

  calculate(context, strategies = ["BASE"]) {
    const breakdown = {};
    if (!strategies.length) strategies = ["BASE"];

    for (const strategy of strategies) {
      breakdown[strategy] = this.strategies[strategy].calculate(context);
    }

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0.0);

    return {
      breakdown,
      total,
    };
  }
}

module.exports = new PricingEngine();
