const express = require("express");
const router = express.Router();
const TripsController = require("../controllers/trips");
const tripsController = new TripsController();
const useValidation = require("../middlewares/validation");
const authMiddleware = require("../middlewares/auth");

router.post("/:id/start", tripsController.startTrip);

router.get("/:id/status", tripsController.getTripStatus);

router.get("/:id/payment-details", tripsController.fareDetails);

router.post("/:id/end", tripsController.endTrip);

module.exports = router;
