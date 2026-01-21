const {
  AuthenticationError,
  AuthorizationError,
} = require("../core/errors/errors");
// const httpClient = require("../core/lib/network/http-client");

const authMiddleware = async (req, res, next) => {
  try {
    // const headers = pick(req.headers, HEADER_ALLOWLIST);
    let response = { data: true };
    try {
      //   response = await httpClient.request(
      //     ENDPOINTS.VerifyToken,
      //     {
      //       headers: headers,
      //     },
      //     {
      //       retry: {
      //         retries: 1,
      //       },
      //     }
      //   );
    } catch (error) {
      throw new AuthorizationError("failed to authenticate user");
    }
    if (!response.data) {
      return next(new AuthenticationError("failed to authenticate user"));
    }
    return next();
  } catch (e) {
    return next(e);
  }
};

module.exports = authMiddleware;
