const redisClient = require("../database/redis");
const db = require("../database");
const logger = require("../core/lib/logger");
const { DatabaseError, ValidationError } = require("../core/errors/errors");
const { omitBy, isNull, includes } = require("lodash");

class Payments {
  constructor() {
    this.redisClient = redisClient;
    this.db = db;
  }

  createRequest = async ({ payload, transaction = null }) => {
    try {
      if (
        !payload.referenceId ||
        !payload.referenceType ||
        !payload.amount ||
        !payload.currency
      )
        throw new ValidationError("Invalid payment request payload");
      const ride = await this.db.PaymentRequests.create(payload, {
        transaction,
      });

      return ride;
    } catch (error) {
      logger.error("Error in Payments: createRequest :", error);
      throw new DatabaseError("Error in Payments: createRequest :", error);
    }
  };

  requestSatus = async ({
    id = null,
    referenceId = null,
    referenceType = null,
    transaction = null,
  }) => {
    try {
      if (!id && !referenceId) throw new ValidationError("Invalid request");
      const filter = omitBy({ id, referenceId, referenceType }, isNull);
      const paymentRequest = await this.db.PaymentRequests.findOne({
        where: filter,
        transaction,
        raw: true,
      });

      return {
        id: paymentRequest?.id,
        city: paymentRequest?.city,
        currency: paymentRequest?.currency,
        status: paymentRequest?.status,
      };
    } catch (error) {
      logger.error("Error in Payments: requestSatus :", error);
      throw new DatabaseError("Error in Payments: requestSatus :", error);
    }
  };

  lockRequestById = async ({
    id,
    validStatus = ["REQUESTED"],
    transaction,
  }) => {
    try {
      const request = await this.db.PaymentRequests.findOne({
        where: { id },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      if (!request) {
        throw new ValidationError("Payment request not found");
      }

      if (!validStatus.includes(request.status)) {
        throw new ValidationError("Trip status invalid");
      }

      return request;
    } catch (error) {
      logger.error("Error in lockRequestById:", error);
      throw new DatabaseError("Error in lockRequestById:", error);
    }
  };

  getAttempt = async ({ paymentRequestId, status, transaction = null }) => {
    try {
      if (!paymentRequestId) throw new ValidationError("Invalid request");
      const filter = { paymentRequestId };
      if (status) filter.status = status;
      return this.db.PaymentAttempts.findOne({ where: filter, transaction });
    } catch (error) {
      logger.error("Error in Payments: getAttempt:", error);
      throw new DatabaseError("Error in Payments: getAttempt:", error);
    }
  };

  createAttempt = async ({
    paymentRequestId,
    method,
    vendor,
    amount,
    status,
    transaction = null,
  }) => {
    try {
      const ride = await this.db.PaymentAttempts.create(
        {
          paymentRequestId,
          method,
          vendor,
          amount,
          status,
        },
        { transaction }
      );

      return ride;
    } catch (error) {
      logger.error("Error in Payments:createAttempt :", error);
      throw new DatabaseError("Error in Payments:createAttempt :", error);
    }
  };

  lockAttemptById = async ({ id, transaction }) => {
    try {
      const attempt = await this.db.PaymentAttempts.findOne({
        where: { id },
        include: {
          model: this.db.PaymentRequests,
          attributes: ["referenceId"],
        },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      if (!attempt) {
        throw new ValidationError("Payment attempt not found");
      }

      return attempt;
    } catch (error) {
      logger.error("Error in lockAttemptById:", error);
      throw new DatabaseError("Error in lockAttemptById:", error);
    }
  };

  updateRequest = async ({ id, payload, transaction }) => {
    try {
      const filter = {};
      if (id) filter.id = id;
      if (!Object.keys(filter).length)
        throw new ValidationError("Payments: Invalid filter for update");
      return this.db.PaymentRequests.update(payload, {
        where: filter,
        transaction,
      });
    } catch (error) {
      logger.error("Error in Payments: updateRequest:", error);
      throw new DatabaseError("Error in Payments: updateRequest:", error);
    }
  };

  getRequest = async ({
    id = null,
    referenceId = null,
    referenceType = null,
    status = null,
    transaction = null,
  }) => {
    try {
      if (!id && !(referenceId && referenceType))
        throw new ValidationError("Invalid request");
      const filter = omitBy({ id, referenceType, referenceId }, isNull);
      if (status) filter.status = status;
      return this.db.PaymentRequests.findOne({ where: filter, transaction });
    } catch (error) {
      logger.error("Error in Payments: getRequest:", error);
      throw new DatabaseError("Error in Payments: getRequest:", error);
    }
  };
}

module.exports = Payments;
