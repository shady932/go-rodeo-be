const express = require("express");
const router = express.Router();
const RidesController = require("../controllers/rides");
const ridesController = new RidesController();
// const bookingValidator = require("../validators/booking");
// const useValidation = require("../middlewares/validation");

router.post(
  "/",
  //   bookingValidator.createbookingValidator,
  //   useValidation,
  ridesController.createRequest
);

router.get("/:id", ridesController.getRideStatus);

module.exports = router;
