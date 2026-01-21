/**
 * Response normalized error
 * @extends Error
 */
class BaseError extends Error {
  constructor(message, data, status, isOperational = true, isPublic, isOverrideSuccess = false) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.isPublic = isPublic;
    this.isOperational = isOperational;
    this.data = data;
    this.isOverrideSuccess = isOverrideSuccess;

    Error.captureStackTrace(this);
  }
}

module.exports = { BaseError };
