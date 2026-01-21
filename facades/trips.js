const RidesService = require("../services/rides");
const DriversService = require("../services/drivers");
const TripsService = require("../services/trips");
const logger = require("../core/lib/logger");
const { InternalError } = require("../core/errors/errors");
const { BaseError } = require("../core/errors/base-error");
const moment = require("moment-timezone");
const pricingEngine = require("../strategies/pricing/engine");
const CurrencyService = require("../services/currency");
const PaymentsService = require("../services/payments");
const db = require("../database");
const wsHub = require("../realtime/hub");

class Trips {
  constructor() {
    this.ridesService = new RidesService();
    this.driversService = new DriversService();
    this.tripsService = new TripsService();
    this.pricingEngine = pricingEngine;
    this.currencyService = new CurrencyService();
    this.paymentsService = new PaymentsService();
    this.wsHub = wsHub;
  }

  endTrip = async ({ tripId, driverId, distanceCovered = 15 }) => {
    let transaction;
    try {
      transaction = await db.sequelize.transaction();
      //Lock trip
      const trip = await this.tripsService.lockTripById({
        id: tripId,
        driverId,
        validStatus: ["STARTED", "PAUSED"],
        transaction,
      });

      //Trip context
      const startTime = moment.utc(trip.startTime);
      const endTime = moment.utc();
      const context = {
        baseFare: trip.baseFare,
        duration: endTime.diff(startTime, "minutes"),
        distance: distanceCovered,
      };

      //Fare calculation
      const { total: fareAmountINR, breakdown } = this.pricingEngine.calculate(
        context,
        ["BASE", "TIME", "DIST", "SRGE"],
      );
      const fareAmount = this.currencyService.convert({
        userCurrency: "INR",
        baseValue: fareAmountINR,
      });
      Object.keys(breakdown).forEach((key) => {
        breakdown[key] = this.currencyService.convert({
          userCurrency: "INR",
          baseValue: breakdown[key],
        });
      });

      //Create payment request
      const paymentRequest = await this.paymentsService.createRequest({
        transaction,
        payload: {
          referenceType: "TRIP",
          referenceId: trip.id,
          amount: fareAmount,
          currency: "INR",
          city: trip.city,
          meta: {
            tripId: trip.id,
            status: "ENDED",
            fareAmount,
            durationMinutes: endTime.diff(startTime, "minutes"),
            breakdown,
          },
        },
      });

      //Update trip
      await this.tripsService.update({
        id: trip.id,
        payload: {
          status: "ENDED",
          endTime: endTime.toISOString(),
          fareAmount: fareAmount,
          paymentRequestId: paymentRequest.id,
        },
        transaction,
      });

      await this.wsHub.sendToUser(trip.riderId, {
        type: "PAYMENT_REQUEST",
        payload: {
          tripId: trip.id,
          status: "ENDED",
          fareAmount,
          durationMinutes: endTime.diff(startTime, "minutes"),
          breakdown,
        },
      });

      await transaction.commit();

      return {
        tripId: trip.id,
        status: "ENDED",
        fareAmount,
        durationMinutes: endTime.diff(startTime, "minutes"),
      };
    } catch (error) {
      await transaction.rollback();
      logger.error("Error in endTrip: ", error);
      if (error instanceof BaseError) throw error;
      throw new InternalError("Error in endTrip: ", error);
    }
  };

  getTripStatus = async ({ tripId }) => {
    try {
      const trip = await this.tripsService.get({ id: tripId });
      return {
        tripId,
        status: trip[0]?.status,
      };
    } catch (error) {
      logger.error("Error in getTripStatus: ", error);
      if (error instanceof BaseError) throw error;
      throw new InternalError("Error in getTripStatus: ", error);
    }
  };

  fareDetails = async ({ tripId }) => {
    try {
      const paymentRequest = await this.paymentsService.getRequest({
        referenceId: tripId,
        referenceType: "TRIP",
        status: ["REQUESTED"],
      });
      return paymentRequest?.meta || {};
    } catch (error) {
      logger.error("Error in fareDetails: ", error);
      if (error instanceof BaseError) throw error;
      throw new InternalError("Error in fareDetails: ", error);
    }
  };
}

module.exports = Trips;
