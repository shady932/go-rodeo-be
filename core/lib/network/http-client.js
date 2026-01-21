const { InternalError } = require("../../errors/errors");
const ConfigManager = require("../config/manager");
const RequestClient = require("./_client");
const retry = require("../async-retry");
const CircuitBreaker = require("opossum");

class HttpClient {
  constructor() {
    this._endPointConfig = this._loadConfig();
    this._client = new RequestClient();
  }

  request = async (endpoint, requestOptions, config) => {
    const { method, url, timeout, internal } = this._getEndpointDetails(
      endpoint,
      requestOptions.pathParams
    );
    switch (true) {
      case !!config.retry:
        return await this._requestWithRetry(method, url, requestOptions, timeout, config.retry);
      case !!config.breaker || internal:
        return await this._requestWithBreaker(method, url, requestOptions, timeout, config.breaker);
      default:
        return await this._client.send(method, url, requestOptions, timeout);
    }
  };

  _requestWithRetry = async (method, url, requestOptions, timeout, retryOptions) => {
    const options = {
      retries: retryOptions.retries || 1,
      factor: retryOptions.factor || 3,
      minTimeout: retryOptions.minTimeout || 1 * 1000,
      maxTimeout: retryOptions.maxTimeout || 60 * 1000,
      randomize: retryOptions.randomize || false,
    };
    return await retry(async (bail) => {
      try {
        return await this._client.send(method, url, requestOptions, timeout);
      } catch (error) {
        if (error.response && String(error.response.status).startsWith("4")) {
          return bail(error);
        }
        throw error;
      }
    }, options);
  };

  _requestWithBreaker = async (method, url, requestOptions, timeout, breakerOptions) => {
    const options = {
      timeout: breakerOptions.timeout || 30000, // If our function takes longer than 15 seconds, trigger a failure
      errorThresholdPercentage: breakerOptions.errorThresholdPercentage || 75, // When 50% of requests fail, trip the circuit
      resetTimeout: breakerOptions.resetTimeout || 30000, // After 30 seconds, try again.
    };
    const breaker = new CircuitBreaker(this._client.send, options);
    if (breakerOptions.fallback) {
      breaker.fallback(breakerOptions.fallback);
      breaker.on(
        "fallback",
        (result) => `Circuit breaker triggered fallback with result: ${result}`
      );
    }
    return await breaker.fire(method, url, requestOptions, timeout);
  };

  _getEndpointDetails = (endpoint, replaceParams) => {
    try {
      const epConf = this._endPointConfig[endpoint];
      let { method, url, pathParams, timeout, internal } = epConf;
      pathParams = pathParams || [];
      pathParams.forEach((pp) => {
        url = url = url.replace(new RegExp(`:${pp}`, "g"), replaceParams[pp]);
      });
      return { method, url, timeout, internal };
    } catch (e) {
      console.log(e);
      throw new InternalError("Invalid endpoint configuration.", e);
    }
  };

  _loadConfig = () => {
    const apiEndpoints = ConfigManager.get("API_ENDPOINTS");
    const serviceEndpoints = apiEndpoints.serviceEndpoints;
    const externalEndpoints = apiEndpoints.externalEndpoints;
    const internalEndpointConfig = this._loadEndPointsConfig(serviceEndpoints, true);
    const externalEndpointConfig = this._loadEndPointsConfig(externalEndpoints, false);
    return {
      ...internalEndpointConfig,
      ...externalEndpointConfig,
    };
  };

  _loadEndPointsConfig(serviceEndpoints, internal) {
    const endpointConfig = {};
    Object.keys(serviceEndpoints).forEach((service) => {
      const baseUrl =
        process.env.IS_EKS === "true"
          ? serviceEndpoints[service].baseUrl || `https://${service}`
          : serviceEndpoints[service].publicUrl || serviceEndpoints[service].baseUrl;
      const endpoints = serviceEndpoints[service].endpoints;
      Object.keys(endpoints).forEach((endpoint) => {
        endpointConfig[endpoint] = {
          method: endpoints[endpoint].method,
          url: baseUrl + endpoints[endpoint].path,
          pathParams: endpoints[endpoint].pathParams,
          timeout: endpoints[endpoint].timeout,
          internal: internal,
        };
      });
    });
    return endpointConfig;
  }
}

const httpClient = new HttpClient();

module.exports = httpClient;
