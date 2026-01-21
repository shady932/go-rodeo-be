const cors = require("cors");
const { AuthorizationError } = require("../core/errors/errors");

const getAllowedDomains = () => {
  const staticDomains = [
    `localhost:${process.env.PORT}`,
    `127.0.0.1:${process.env.PORT}`,
    "http://localhost",
    "http://localhost:5173",
  ];
  const allowDomains = "".split(",");
  return staticDomains.concat(allowDomains);
};

const regularCors = cors({
  origin: async (origin, callback) => {
    const allowdomains = getAllowedDomains();
    const msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
    const authError = new AuthorizationError(msg);
    if (!origin) {
      return callback(null, true);
    }
    if (!allowdomains.includes(origin)) {
      return callback(authError, false);
    }
    callback(null, true);
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  credentials: true, // allow session cookie from browser to pass through
});

module.exports = async (req, res, next) => {
  // if (ConfigManager.get("OPEN_ENDPOINTS").split(",").includes(req.path)) {
  //   return next();
  // }
  regularCors(req, res, next);
};
