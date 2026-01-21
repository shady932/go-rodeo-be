const RidesService = require("../services/rides");
const DriversService = require("../services/drivers");
const TripsService = require("../services/trips");
const logger = require("../core/lib/logger");
const {
  InternalError,
  BadRequestError,
  ValidationError,
} = require("../core/errors/errors");
const { BaseError } = require("../core/errors/base-error");
const db = require("../database");
const wsHub = require("../realtime/hub");

class Drivers {
  constructor() {
    this.ridesService = new RidesService();
    this.driversService = new DriversService();
    this.tripsService = new TripsService();
    this.wsHub = wsHub;
  }

  acceptRide = async ({ driverId, rideId }) => {
    let transaction;
    try {
      //Driver must not have active trip
      const activeTrip = await this.tripsService.get({
        driverId,
        status: ["ACCEPTED", "STARTED", "PAUSED"],
      });

      if (activeTrip.length) {
        throw new ValidationError("Driver already on active trip");
      }

      transaction = await db.sequelize.transaction();
      //Lock ride row
      const ride = await this.ridesService.lockRideById({
        id: rideId,
        transaction,
      });

      //Assign ride
      await this.ridesService.update({
        id: rideId,
        payload: {
          status: "ASSIGNED",
          assignedDriverId: driverId,
        },
        transaction,
      });

      //Create trip
      const trip = await this.tripsService.create({
        rideId: ride.id,
        riderId: ride.riderId,
        driverId,
        status: "ACCEPTED",
        startTime: null,
        city: ride.city,
        transaction,
      });

      //Notify rider
      await this.wsHub.sendToUser(ride.riderId, {
        type: "RIDE_STATUS_UPDATE",
        payload: { status: "ACCEPTED" },
      });

      await transaction.commit();
      return {
        rideId: ride.id,
        tripId: trip.id,
        status: "ACCEPTED",
      };
    } catch (error) {
      if (transaction) await transaction.rollback();
      logger.error("Error in acceptRide:", error);
      if (error instanceof BaseError) throw error;
      throw new InternalError("Error accepting ride", error);
    }
  };
}

module.exports = Drivers;
