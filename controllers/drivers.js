const ApiResponse = require("../core/lib/response");
const DriversService = require("../services/drivers");
const DriversFacade = require("../facades/drivers");

class Drivers {
  constructor() {
    this.driversService = new DriversService();
    this.driversFacade = new DriversFacade();
  }

  updateLocation = async (req, res, next) => {
    try {
      const { id: driverId } = req.params;
      const { latitude, longitude, city } = req.body;
      const ack = await this.driversService.updateLocation({
        driverId,
        latitude,
        longitude,
        city,
      });
      const response = new ApiResponse({
        success: !!ack,
        data: ack,
        message: "Driver Location update is successfull.",
      });
      res.status(response.status).json(response);
    } catch (e) {
      next(e);
    }
  };

  acceptRide = async (req, res, next) => {
    try {
      const { id: driverId } = req.params;
      const { rideId } = req.body;
      const ack = await this.driversFacade.acceptRide({
        driverId,
        rideId,
      });
      const response = new ApiResponse({
        success: !!ack,
        data: ack,
        message: "Ride accepted",
      });
      res.status(response.status).json(response);
    } catch (e) {
      next(e);
    }
  };
}

module.exports = Drivers;
