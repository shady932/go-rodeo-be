const redisClient = require("../database/redis");
const db = require("../database");
const logger = require("../core/lib/logger");
const { DatabaseError } = require("../core/errors/errors");
const moment = require("moment-timezone");
const wsHub = require("../realtime/hub");

class Trips {
  constructor() {
    this.redisClient = redisClient;
    this.db = db;
    this.wsHub = wsHub;
  }

  get = async ({
    id,
    rideId,
    riderId,
    status,
    driverId,
    transaction = null,
  }) => {
    try {
      const filter = {};
      if (id) filter.id = id;
      if (rideId) filter.rideId = rideId;
      if (riderId) filter.riderId = riderId;
      if (driverId) filter.driverId = driverId;
      if (!Object.keys(filter).length)
        throw new DatabaseError("Error in Trips:get: Invalid filter");
      if (status) filter.status = status;
      return this.db.Trips.findAll({ where: filter, transaction });
    } catch (error) {
      logger.error("Error in Trips:get:", error);
      throw new DatabaseError("Error in Trips:get:", error);
    }
  };

  create = async ({
    rideId,
    riderId,
    driverId,
    status,
    startTime,
    city,
    transaction = null,
  }) => {
    try {
      const ride = await this.db.Trips.create(
        {
          rideId,
          riderId,
          driverId,
          status,
          startTime,
          city,
        },
        { transaction }
      );

      return ride;
    } catch (error) {
      logger.error("Error in Trips:create :", error);
      throw new DatabaseError("Error in Trips:create :", error);
    }
  };

  lockTripById = async ({
    id,
    driverId,
    validStatus = ["REQUESTED"],
    transaction,
  }) => {
    try {
      const trip = await this.db.Trips.findOne({
        where: { id },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      if (!trip) {
        throw new ValidationError("Trip not found");
      }

      if (!validStatus.includes(trip.status)) {
        throw new ValidationError("Trip status invalid");
      }

      //Only assigned driver can start
      if (String(trip.driverId) !== String(driverId)) {
        throw new ConflictError("Driver not assigned to this trip");
      }

      return trip;
    } catch (error) {
      logger.error("Error in lockTripById:", error);
      throw new DatabaseError("Error in lockTripById:", error);
    }
  };

  startTrip = async ({ tripId, driverId }) => {
    let transaction;
    try {
      transaction = await db.sequelize.transaction();
      //Lock trip
      const trip = await this.lockTripById({
        id: tripId,
        driverId,
        validStatus: ["ACCEPTED"],
        transaction,
      });

      //Update trip
      await trip.update(
        {
          status: "STARTED",
          startTime: moment.utc().toISOString(),
        },
        { transaction }
      );

      await this.wsHub.sendToUser(trip.riderId, {
        type: "RIDE_STATUS_UPDATE",
        payload: { status: "STARTED" },
      });

      await transaction.commit();

      return {
        tripId: trip.id,
        status: "STARTED",
        startTime: trip.startTime,
      };
    } catch (error) {
      if (transaction) await transaction.rollback();
      logger.error("Error in Trips:startTrip :", error);
      throw new DatabaseError("Error in Trips:startTrip :", error);
    }
  };

  update = async ({ id, payload, transaction }) => {
    try {
      const filter = {};
      if (id) filter.id = id;
      if (!Object.keys(filter).length)
        throw new ValidationError("Trips: Invalid filter for update");
      return this.db.Trips.update(payload, { where: filter, transaction });
    } catch (error) {
      logger.error("Error in Trips: update:", error);
      throw new DatabaseError("Error in Trips: update:", error);
    }
  };

  getAvailableDrivers = async (driverIds) => {
    try {
      if (!driverIds.length) return [];

      const busyDrivers = await this.db.Trips.findAll({
        attributes: ["driverId"],
        where: {
          driverId: driverIds,
          status: ["ACCEPTED", "STARTED", "PAUSED"],
        },
        raw: true,
      });

      const busySet = new Set(busyDrivers.map((d) => String(d.driverId)));

      return driverIds.filter((id) => !busySet.has(String(id)));
    } catch (error) {
      logger.error("Error in getAvailableDrivers: ", error);
      throw new DatabaseError("Error in getAvailableDrivers: ", error);
    }
  };
}

module.exports = Trips;
