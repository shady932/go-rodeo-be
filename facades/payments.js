const RidesService = require("../services/rides");
const DriversService = require("../services/drivers");
const TripsService = require("../services/trips");
const logger = require("../core/lib/logger");
const { InternalError } = require("../core/errors/errors");
const { BaseError } = require("../core/errors/base-error");
const moment = require("moment-timezone");
const CurrencyService = require("../services/currency");
const PaymentsService = require("../services/payments");
const PaymentGatewayFactory = require("../factories/payments/factory");
const db = require("../database");
const wsHub = require("../realtime/hub");
const stripe = require("../core/utils/stripe");

class Payments {
  constructor() {
    this.ridesService = new RidesService();
    this.driversService = new DriversService();
    this.tripsService = new TripsService();
    this.currencyService = new CurrencyService();
    this.paymentsService = new PaymentsService();
    this.wsHub = wsHub;
  }

  attempt = async ({ paymentRequestId, method }) => {
    let attempt, transaction;
    try {
      transaction = await db.sequelize.transaction();

      //Lock payment request
      const request = await this.paymentsService.lockRequestById({
        id: paymentRequestId,
        transaction,
      });

      //Ensure no active attempt
      const activeAttempt = await this.paymentsService.getAttempt({
        paymentRequestId,
        transaction,
        status: "INITIATED",
      });

      if (activeAttempt) {
        throw new ConflictError("Payment already in progress");
      }

      //Select gateway
      const gateway = PaymentGatewayFactory.getGateway({
        method,
        city: request.city,
        currency: request.currency,
      });

      //Create attempt
      attempt = await this.paymentsService.createAttempt({
        paymentRequestId: request.id,
        method,
        vendor: gateway.vendor,
        amount: request.amount,
        status: "INITIATED",
        transaction,
      });

      //Initiate payment
      const initiationResult = await gateway.initiatePayment({
        amount: request.amount,
        currency: request.currency,
        paymentAttemptId: attempt.id,
      });

      await transaction.commit();

      console.log({
        paymentAttemptId: attempt.id,
        ...initiationResult,
      });
      return {
        paymentAttemptId: attempt.id,
        ...initiationResult,
      };
    } catch (error) {
      if (attempt) {
        await attempt.update({ status: "FAILED" }, { transaction });
        await transaction.commit();
      } else {
        await transaction.rollback();
      }
      logger.error("Error in attemptPayment: ", error);
      if (error instanceof BaseError) throw error;
      throw new InternalError("Error in attemptPayment: ", error);
    }
  };

  processWebhook = async ({ gateway, payload }) => {
    try {
      switch (gateway) {
        case "STRIPE":
          return await this.stripeWebhook(payload);
      }
    } catch (error) {
      logger.error("Error in processWebhook: ", error);
      if (error instanceof BaseError) throw error;
      throw new InternalError("Error in processWebhook: ", error);
    }
  };

  stripeWebhook = async ({ signature, rawBody }) => {
    let event,
      transaction,
      paymentStatus = "FAILED",
      userId;
    try {
      try {
        event = rawBody;
        // stripe.webhooks.constructEvent(
        //   rawBody,
        //   signature,
        //   process.env.STRIPE_WEBHOOK_SECRET
        // );
      } catch (err) {
        logger.error("Invalid Stripe webhook signature", err);
        throw new ValidationError("Invalid Stripe webhook signature");
      }
      const intent = event.data.object;
      const attemptId = intent.metadata.payment_attempt_id;
      transaction = await db.sequelize.transaction();
      const attempt = await this.paymentsService.lockAttemptById({
        id: attemptId,
        transaction,
      });

      if (!attempt || attempt?.status !== "INITIATED") {
        await transaction.commit();
        return;
      }
      const trip = await this.tripsService.get({
        id: attempt.PaymentRequest.referenceId,
        transaction,
      });
      userId = trip[0]?.riderId;

      // --- handle events ---
      if (event.type === "payment_intent.succeeded") {
        await attempt.update(
          {
            status: "SUCCESS",
          },
          { transaction }
        );

        await this.paymentsService.updateRequest({
          id: attempt.paymentRequestId,
          payload: {
            status: "PAID",
          },
          transaction,
        });
        paymentStatus = "SUCCESS";
      }

      if (event.type === "payment_intent.payment_failed") {
        await attempt.update(
          {
            status: "FAILED",
          },
          { transaction }
        );
      }

      await transaction.commit();

      return true;
    } catch (error) {
      if (transaction) await transaction.rollback();
      logger.error("Error in stripeWebhook:", error);
      if (error instanceof BaseError) throw error;
      throw new InternalError("Error processing Stripe webhook", error);
    } finally {
      if (userId)
        await this.wsHub.sendToUser(userId, {
          type: "PAYMENT_STATUS",
          payload: {
            status: paymentStatus,
          },
        });
    }
  };
}

module.exports = Payments;
