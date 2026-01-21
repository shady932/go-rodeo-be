const ApiResponse = require("../core/lib/response");
const RidesService = require("../services/rides");
const RidesFacade = require("../facades/rides");

class Rides {
  constructor() {
    this.ridesService = new RidesService();
    this.ridesFacade = new RidesFacade();
  }

  createRequest = async (req, res, next) => {
    try {
      const { pickup, drop, city, userId } = req.body;
      const ack = await this.ridesFacade.createRequest({
        pickup,
        drop,
        city,
        userId,
      });
      const response = new ApiResponse({
        success: !!ack,
        data: ack,
        message: "Ride request posted succesfully",
      });
      res.status(response.status).json(response);
    } catch (e) {
      next(e);
    }
  };

  getRideStatus = async (req, res, next) => {
    try {
      const { id: rideId } = req.params;
      const ack = await this.ridesFacade.getRideStatus({
        rideId,
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
}

module.exports = Rides;
