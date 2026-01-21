const express = require("express");
const router = express.Router();
const PaymentsController = require("../controllers/payments");
const paymentsController = new PaymentsController();
const useValidation = require("../middlewares/validation");
const authMiddleware = require("../middlewares/auth");

router.post("/", paymentsController.attempt);
router.get("/:id/request", paymentsController.requestStatus);
router.post("/webhook/stripe", paymentsController.stripeWebhook);

module.exports = router;
