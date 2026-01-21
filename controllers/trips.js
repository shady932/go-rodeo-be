const ApiResponse = require("../core/lib/response");
const TripsService = require("../services/trips");
const TripsFacade = require("../facades/trips");

class Trips {
  constructor() {
    this.tripsService = new TripsService();
    this.tripsFacade = new TripsFacade();
  }

  startTrip = async (req, res, next) => {
    try {
      const { id: tripId } = req.params;
      const { driverId } = req.body;
      const ack = await this.tripsService.startTrip({
        tripId,
        driverId,
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

  endTrip = async (req, res, next) => {
    try {
      const { id: tripId } = req.params;
      const { driverId, distanceCovered } = req.body;
      const ack = await this.tripsFacade.endTrip({
        tripId,
        driverId,
        distanceCovered,
      });
      const response = new ApiResponse({
        success: !!ack,
        data: ack,
        message: "Trip ended succesfully",
      });
      res.status(response.status).json(response);
    } catch (e) {
      next(e);
    }
  };

  getTripStatus = async (req, res, next) => {
    try {
      const { id: tripId } = req.params;
      const ack = await this.tripsFacade.getTripStatus({
        tripId,
      });
      const response = new ApiResponse({
        success: !!ack,
        data: ack,
        message: "Ride status posted succesfully",
      });
      res.status(response.status).json(response);
    } catch (e) {
      next(e);
    }
  };

  fareDetails = async (req, res, next) => {
    try {
      const { id: tripId } = req.params;
      const fareBreakdown = await this.tripsFacade.fareDetails({
        tripId,
      });
      const response = new ApiResponse({
        success: !!fareBreakdown,
        data: fareBreakdown,
        message: "Request fetched succesfully",
      });
      res.status(response.status).json(response);
    } catch (e) {
      next(e);
    }
  };
}

module.exports = Trips;
