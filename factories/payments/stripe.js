const BaseGateway = require("./base");
const stripe = require("../../core/utils/stripe");
const logger = require("../../core/lib/logger");
const { DependencyError } = require("../../core/errors/errors");

class StripeGateway extends BaseGateway {
  constructor() {
    super("STRIPE");
  }

  initiatePayment = async ({ amount, currency, paymentAttemptId }) => {
    try {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe uses paise
        currency: currency.toLowerCase(),
        metadata: {
          payment_attempt_id: paymentAttemptId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        redirectType: "STRIPE_CLIENT_SECRET",
        clientSecret: intent.client_secret,
      };
    } catch (error) {
      logger.error("Error in StripeGateway: initiatePayment: ", error);
      throw new DependencyError(
        "Error in StripeGateway: initiatePayment: ",
        error
      );
    }
  };
}

module.exports = StripeGateway;
