"use strict";
require("dotenv").config();

exports.config = {
  app_name: process.env.EW_RELIC_APP_NAME,
  license_key: process.env.NEW_RELIC_LISENCE_KEY,

  distributed_tracing: {
    enabled: true,
  },

  logging: {
    level: "info",
  },

  allow_all_headers: true,

  attributes: {
    enabled: true,
  },
};
