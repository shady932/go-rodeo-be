class BaseGateway {
  constructor(vendor) {
    this.vendor = vendor;
  }

  async initiatePayment(_) {
    throw new Error("initiatePayment not implemented");
  }
}

module.exports = BaseGateway;
