const { BaseError } = require("./base-error");
const { status: HttpStatus } = require("http-status");

/**
 * Class representing a service level error.
 * @extends BaseError
 */
class InternalError extends BaseError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param data - Error data
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   * @param {boolean} isOverrideSuccess - Whether to override request success.
   */
  constructor(
    message,
    data = null,
    status = HttpStatus.INTERNAL_SERVER_ERROR,
    isPublic = false,
    isOverrideSuccess = false
  ) {
    super(message, data, status, true, isPublic, isOverrideSuccess);
  }
}

/**
 * Class representing a DB level error.
 * @extends BaseError
 */
class DatabaseError extends BaseError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param data - Error data
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   * @param {boolean} isOverrideSuccess - Whether to override request success.
   */
  constructor(
    message,
    data = null,
    status = HttpStatus.INTERNAL_SERVER_ERROR,
    isPublic = false,
    isOverrideSuccess = false
  ) {
    super(message, data, status, true, isPublic, isOverrideSuccess);
  }
}

/**
 * Class representing an external dependency error.
 * @extends BaseError
 */
class DependencyError extends BaseError {
  /**
   * Creates a DependencyError error.
   * @param {string} message - Error message.
   * @param data - Error data
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   * @param {boolean} isOverrideSuccess - Whether to override request success.
   */
  constructor(
    message,
    data = null,
    status = HttpStatus.FAILED_DEPENDENCY,
    isPublic = false,
    isOverrideSuccess = false
  ) {
    super(message, data, status, true, isPublic, isOverrideSuccess);
  }
}

/**
 * Class representing a validation error.
 * @extends BaseError
 */
class ValidationError extends BaseError {
  /**
   * Creates a ValidationError error.
   * @param {string} message - Error message.
   * @param data - Error data
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(
    message,
    data = null,
    status = HttpStatus.BAD_REQUEST,
    isPublic = true
  ) {
    super(message, data, status, true, isPublic);
  }
}

/**
 * Class representing unauthorized error.
 * @extends BaseError
 */
class AuthorizationError extends BaseError {
  /**
   * Creates a ValidationError error.
   * @param {string} message - Error message.
   * @param data - Error data
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(
    message,
    data = null,
    status = HttpStatus.FORBIDDEN,
    isPublic = true
  ) {
    super(message, data, status, true, isPublic);
  }
}

/**
 * Class representing payment error.
 * @extends BaseError
 */
class PaymentError extends BaseError {
  /**
   * Creates a ValidationError error.
   * @param {string} message - Error message.
   * @param data - Error data
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(
    message,
    data = null,
    status = HttpStatus.PAYMENT_REQUIRED,
    isPublic = true
  ) {
    super(message, data, status, true, isPublic);
  }
}

/**
 * Class representing unauthorized error.
 * @extends BaseError
 */
class AuthenticationError extends BaseError {
  /**
   * Creates a ValidationError error.
   * @param {string} message - Error message.
   * @param data - Error data
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(
    message,
    data = null,
    status = HttpStatus.UNAUTHORIZED,
    isPublic = true
  ) {
    super(message, data, status, true, isPublic);
  }
}
class SQSPublishError extends BaseError {
  /**
   * Creates a SQSPublishError error.
   * @param {string} message - Error message.
   * @param data - Error data
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(message, data = null, isPublic = true) {
    super(message, data, true, isPublic);
  }
}

class BadRequestError extends BaseError {
  /**
   * Creates a ValidationError error.
   * @param {string} message - Error message.
   * @param data - Error data
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(
    message,
    data = null,
    status = HttpStatus.BAD_REQUEST,
    isPublic = true
  ) {
    super(message, data, status, true, isPublic);
  }
}

module.exports = {
  InternalError,
  DatabaseError,
  DependencyError,
  ValidationError,
  AuthorizationError,
  PaymentError,
  AuthenticationError,
  SQSPublishError,
  BadRequestError,
};
