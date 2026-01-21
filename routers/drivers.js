const express = require("express");
const router = express.Router();
const DriversController = require("../controllers/drivers");
const driversController = new DriversController();
const useValidation = require("../middlewares/validation");
const authMiddleware = require("../middlewares/auth");

router.post("/:id/location", driversController.updateLocation);

router.post("/:id/accept", driversController.acceptRide);

module.exports = router;
