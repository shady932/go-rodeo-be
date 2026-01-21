const ApiResponse = require("../core/lib/response");
const PaymentsFacade = require("../facades/payments");
const PaymentsServices = require("../services/payments");

class Payments {
  constructor() {
    this.paymentsFacade = new PaymentsFacade();
    this.paymentsServices = new PaymentsServices();
  }

  attempt = async (req, res, next) => {
    try {
      const { paymentRequestId, method } = req.body;
      const ack = await this.paymentsFacade.attempt({
        paymentRequestId,
        method,
      });
      const response = new ApiResponse({
        success: !!ack,
        data: ack,
        message: "Trip started succesfully",
      });
      res.status(response.status).json(response);
    } catch (e) {
      next(e);
    }
  };

  requestStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const paymentReq = await this.paymentsServices.requestSatus({
        id,
      });
      const response = new ApiResponse({
        success: !!paymentReq,
        data: paymentReq,
        message: "Request fetched succesfully",
      });
      res.status(response.status).json(response);
    } catch (e) {
      next(e);
    }
  };

  stripeWebhook = async (req, res, next) => {
    try {
      const webhook = await this.paymentsFacade.processWebhook({
        gateway: "STRIPE",
        payload: {
          signature: req.headers["stripe-signature"],
          rawBody: req.body,
        },
      });
      const response = new ApiResponse({
        success: !!webhook,
        data: webhook,
        message: "Request fetched succesfully",
      });
      res.status(response.status).json(response);
    } catch (e) {
      next(e);
    }
  };
}

module.exports = Payments;
