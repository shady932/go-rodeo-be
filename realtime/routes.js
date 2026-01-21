"use strict";
const DriversService = require("../services/drivers");
const driversService = new DriversService();
const hub = require("./hub");

/**
 * Map of WS message types to handlers
 * Each handler receives (ws, payload, context)
 */
const wsRoutes = {
  PING: async (ws, payload) => {
    ws.send(
      JSON.stringify({
        type: "PONG",
        payload: {
          timestamp: Date.now(),
        },
      })
    );
  },

  ECHO: async (ws, payload) => {
    ws.send(
      JSON.stringify({
        type: "ECHO_RESPONSE",
        payload,
      })
    );
  },

  DRIVER_LOCATION_UPDATE: async (ws, payload) => {
    try {
      hub.registerDriver(payload.driverId, ws);
      const response = await driversService.updateLocation(payload);
      ws.send(
        JSON.stringify({
          type: "DRIVER_LOCATION_UPDATE",
          payload: response,
        })
      );
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: "ERROR",
          payload: { message: "Invalid WS message format" },
        })
      );
    }
  },

  RIDER_HEARTBEAT: async (ws, payload) => {
    try {
      console.log("RIDER_HEARTBEAT", payload);
      hub.registerRider(payload.riderId, ws);
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: "ERROR",
          payload: { message: "Invalid WS message format" },
        })
      );
    }
  },
};

module.exports = wsRoutes;
