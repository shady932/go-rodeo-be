const { validationResult } = require("express-validator");
const { ValidationError } = require("../core/errors/errors");

module.exports = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ValidationError("Invalid request.", { errors: errors.array() }));
  }
  next();
};
