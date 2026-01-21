const StripeGateway = require("./stripe");
const DummyGateway = require("./dummy");

class PaymentGatewayFactory {
  constructor() {}

  static gatewayConfig = {
    "BLR:CARD:INR": "STRIPE",
  };

  static getGateway({ method, city, currency }) {
    const gateway = this.gatewayConfig[`${city}:${method}:${currency}`];
    if (!gateway) return new DummyGateway();
    if (gateway === "STRIPE") {
      return new StripeGateway();
    }

    // default
    return new StripeGateway();
  }
}

module.exports = PaymentGatewayFactory;
