const axios = require("axios");

const axiosClient = axios.create();

class RequestClient {
  constructor() {
    this._client = axiosClient;
  }

  send = async (method, url, config = {}, timeout = 30000) => {
    const response = await this._client.request({
      url,
      method,
      timeout,
      ...config,
    });
    return response;
  };

  get client() {
    return this._client;
  }
}

module.exports = RequestClient;
