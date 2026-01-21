const BaseGateway = require("./base");

class DummyGateway extends BaseGateway {
  constructor() {
    super("RAZORPAY");
  }

  async initiatePayment({ amount, currency, paymentAttemptId }) {
    // Simulated response
    return {
      redirectType: "URL",
      redirectUrl: `https://fake-dummy.com/pay/${paymentAttemptId}`,
    };
  }
}

module.exports = DummyGateway;
