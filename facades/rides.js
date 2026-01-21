const RidesService = require("../services/rides");
const DriversService = require("../services/drivers");
const TripsService = require("../services/trips");
const logger = require("../core/lib/logger");
const { InternalError, BadRequestError } = require("../core/errors/errors");
const { BaseError } = require("../core/errors/base-error");
const db = require("../database");
const PaymentsService = require("../services/payments");

class Rides {
  constructor() {
    this.ridesService = new RidesService();
    this.driversService = new DriversService();
    this.tripsService = new TripsService();
    this.paymentsService = new PaymentsService();
  }

  createRequest = async ({ pickup, drop, city, userId }) => {
    let transaction;
    try {
      const activeTrips = await this.tripsService.get({
        riderId: userId,
        status: ["ACCEPTED", "STARTED", "PAUSED"],
      });
      const activeRideRequests = await this.ridesService.getByRider({
        riderId: userId,
        status: ["REQUESTED", "ASSIGNED"],
      });
      if (activeTrips.length || activeRideRequests.length)
        throw new BadRequestError("Ineligible to book");

      transaction = await db.sequelize.transaction();

      const ride = await this.ridesService.createRide({
        pickup,
        drop,
        city,
        userId,
        transaction,
      });

      const drivers = await this.driversService.findNearBy({
        longitude: pickup.longitude,
        latitude: pickup.latitude,
        city,
      });

      const liveDrivers = await this.driversService.getLiveDrivers(drivers);

      const availableDrivers = await this.tripsService.getAvailableDrivers(
        liveDrivers
      );

      if (!availableDrivers.length) {
        await transaction.rollback();
        return { message: "No driver found" };
      }

      await this.driversService.emitRideRequest({
        rideId: ride.id,
        pickup,
        drop,
        drivers: availableDrivers,
      });

      await transaction.commit();

      return {
        rideId: ride.id,
        status: ride.status,
      };
    } catch (error) {
      if (transaction) await transaction.rollback();
      logger.error("Error in createRequest: ", error);
      if (error instanceof BaseError) throw error;
      throw new InternalError("Error in createRequest", error);
    }
  };

  getRideStatus = async ({ rideId }) => {
    try {
      let ride = [],
        trip = [],
        paymentRequest = {};
      ride = await this.ridesService.get({ id: rideId });
      trip = await this.tripsService.get({
        rideId,
        status: ["ACCEPTED", "STARTED", "PAUSED", "ENDED", "PAID"],
      });
      if (trip.length)
        paymentRequest = await this.paymentsService.requestSatus({
          referenceId: trip[0]?.id,
          referenceType: "TRIP",
        });
      return {
        rideId,
        tripId: trip[0]?.id,
        paymentRequestId: paymentRequest.id,
        status: paymentRequest.status
          ? `PAYMENT_${paymentRequest.status}`
          : trip[0]
          ? trip[0].status
          : ride?.[0]?.status,
      };
    } catch (error) {
      logger.error("Error in getRideStatus: ", error);
      if (error instanceof BaseError) throw error;
      throw new InternalError("Error in getRideStatus", error);
    }
  };
}

module.exports = Rides;
