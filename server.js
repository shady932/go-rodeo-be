require("./core/errors/global-error-handler");
const bodyParser = require("body-parser");
const express = require("express");

const app = express();
const cookieParser = require("cookie-parser");

const errorMiddleware = require("./middlewares/errorHandler");
const corsMiddleware = require("./middlewares/cors");
const notFound = require("./middlewares/notFound");
const registerRoutes = require("./routers");

app.use(corsMiddleware);
app.use(cookieParser());
app.use(
  bodyParser.json({
    limit: "5mb",
    verify: (req, res, buf, encoding) => {
      if (req.headers["x-shopify-hmac-sha256"])
        req.rawBody = buf.toString(encoding);
    },
  })
);
app.use(bodyParser.urlencoded({ extended: true }));

//Routes
registerRoutes(app);

// Global error handling
app.use(errorMiddleware);

// Not found
app.use(notFound);

module.exports = app;
