const redisClient = require("../database/redis");
const db = require("../database");
const logger = require("../core/lib/logger");
const { DatabaseError, ValidationError } = require("../core/errors/errors");

class Rides {
  constructor() {
    this.redisClient = redisClient;
    this.db = db;
  }

  createRide = async ({ pickup, drop, city, userId, transaction = null }) => {
    try {
      const ride = await this.db.Rides.create(
        {
          riderId: userId,
          pickupLat: pickup.latitude,
          pickupLng: pickup.longitude,
          dropLat: drop.latitude,
          dropLng: drop.longitude,
          city,
          status: "REQUESTED",
        },
        { transaction }
      );

      return ride;
    } catch (error) {
      logger.error("Error in createRide:", error);
      throw new DatabaseError("Error in createRide:", error);
    }
  };

  getByRider = async ({ riderId, status, transaction = null }) => {
    try {
      const filter = { riderId };
      if (status) filter.status = status;
      return this.db.Rides.findAll({ where: filter, transaction });
    } catch (error) {
      logger.error("Error in getByRider:", error);
      throw new DatabaseError("Error in getByRider:", error);
    }
  };

  lockRideById = async ({ id, validStatus = ["REQUESTED"], transaction }) => {
    try {
      const ride = await this.db.Rides.findOne({
        where: { id },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      if (!ride) {
        throw new ValidationError("Ride not found");
      }

      if (!validStatus.includes(ride.status)) {
        throw new ValidationError("Ride already accepted");
      }

      return ride;
    } catch (error) {
      logger.error("Error in lockRideById:", error);
      throw new DatabaseError("Error in lockRideById:", error);
    }
  };

  update = async ({ id, payload, transaction }) => {
    try {
      const filter = {};
      if (id) filter.id = id;
      if (!Object.keys(filter).length)
        throw new ValidationError("Rides: Invalid filter for update");
      return this.db.Rides.update(payload, { where: filter, transaction });
    } catch (error) {
      logger.error("Error in Rides: update:", error);
      throw new DatabaseError("Error in Rides: update:", error);
    }
  };

  get = async ({ id, riderId, status, transaction = null }) => {
    try {
      const filter = {};
      if (id) filter.id = id;
      if (riderId) filter.riderId = riderId;
      if (!Object.keys(filter).length)
        throw new DatabaseError("Error in Trips:get: Invalid filter");
      if (status) filter.status = status;
      return this.db.Rides.findAll({ where: filter, transaction });
    } catch (error) {
      logger.error("Error in Trips:get:", error);
      throw new DatabaseError("Error in Trips:get:", error);
    }
  };
}

module.exports = Rides;
