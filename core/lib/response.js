const { status: httpStatus } = require("http-status");

const DataSymbol = Symbol("data");
const StatusSymbol = Symbol("status");
const SuccessSymbol = Symbol("success");
const ErrorsSymbol = Symbol("errors");
const MessageSymbol = Symbol("message");

module.exports = class ApiResponse {
  constructor({
    success = true,
    data = {},
    message = "",
    status = httpStatus.OK,
    errors = [],
  }) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.status = status;
    this.errors = errors;
  }

  get data() {
    return this[DataSymbol];
  }

  set data(data) {
    this[DataSymbol] = data;
  }

  get status() {
    return this[StatusSymbol];
  }

  set status(status) {
    this[StatusSymbol] = status;
  }

  get success() {
    return this[SuccessSymbol];
  }

  set success(success) {
    this[SuccessSymbol] = success;
  }

  get errors() {
    return this[ErrorsSymbol];
  }

  set errors(errors) {
    if (!Array.isArray(errors)) {
      errors = errors ? [errors] : [];
    }
    this[ErrorsSymbol] = errors;
  }

  get message() {
    return this[MessageSymbol];
  }

  set message(message) {
    this[MessageSymbol] = message;
  }

  toJSON() {
    return {
      success: this.success,
      data: this.data,
      message: this.message,
      status: this.status,
      errors: this.errors,
    };
  }
};
