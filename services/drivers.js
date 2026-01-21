const redisClient = require("../database/redis");
const db = require("../database");
const logger = require("../core/lib/logger");
const {
  DatabaseError,
  ValidationError,
  BadRequestError,
} = require("../core/errors/errors");
const {
  MAX_DRIVERS_DEFAULT,
  MAX_DRIVER_RADIUS_DEFAULT,
} = require("../constants");
const wsHub = require("../realtime/hub");

class Drivers {
  constructor() {
    this.redisClient = redisClient;
    this.db = db;
    this.wsHub = wsHub;
  }

  updateLocation = async ({ driverId, latitude, longitude, city }) => {
    try {
      if (!driverId || latitude == null || longitude == null || !city) {
        throw new ValidationError(
          "updateLocation: Missing required location parameters"
        );
      }

      const redisGeoKey = `drivers:locations:${city}`;
      const redisStatusKey = `drivers:active:${driverId}`;

      /**
       * GEOADD key longitude latitude member
       * Redis updates location if member already exists
       */
      await this.redisClient.geoAdd(redisGeoKey, {
        longitude,
        latitude,
        member: String(driverId),
      });

      await this.redisClient.set(redisStatusKey, "1", {
        expiration: { type: "EX", value: 10 }, // seconds
      });

      return {
        success: true,
        driverId,
      };
    } catch (error) {
      logger.error("Error in updateLocation:", error);
      throw new DatabaseError("Error updating driver location", error);
    }
  };

  findNearBy = async ({
    latitude,
    longitude,
    city,
    maxMatches = MAX_DRIVERS_DEFAULT,
    maxSearchRadius = MAX_DRIVER_RADIUS_DEFAULT,
  }) => {
    try {
      const redisKey = `drivers:locations:${city}`;

      const drivers = await this.redisClient.geoSearch(
        redisKey,
        {
          longitude: longitude,
          latitude: latitude,
        },
        {
          radius: maxSearchRadius,
          unit: "km",
          COUNT: maxMatches,
        }
      );

      return drivers || [];
    } catch (error) {
      logger.error("Error in findNearBy:", error);
      throw new DatabaseError("Error finding nearby driver", error);
    }
  };

  getLiveDrivers = async (driverIds) => {
    try {
      if (!driverIds.length) return [];

      const pipeline = this.redisClient.multi();

      for (const driverId of driverIds) {
        pipeline.exists(`drivers:active:${driverId}`);
      }

      const results = await pipeline.exec();

      const liveDrivers = [];

      results.forEach((exists, index) => {
        if (exists === 1) {
          liveDrivers.push(driverIds[index]);
        }
      });

      return liveDrivers;
    } catch (error) {
      logger.error("Error in getLiveDrivers: ", error);
      throw new DatabaseError("Error in getLiveDrivers: ", error);
    }
  };

  emitRideRequest = async ({ rideId, pickup, drop, drivers }) => {
    try {
      for (const driverId of drivers) {
        this.wsHub.sendToDriver(driverId, {
          type: "RIDE_REQUEST",
          payload: {
            rideId,
            pickup,
            drop,
          },
        });
      }
    } catch (error) {
      logger.error("Error in emitRideRequest:", error);
      throw new BadRequestError("Error in emitRideRequest:", error);
    }
  };
}

module.exports = Drivers;
