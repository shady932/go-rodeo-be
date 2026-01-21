"use strict";

const WebSocket = require("ws");
const wsRoutes = require("./routes");

function initWebSocketServer(httpServer) {
  const wss = new WebSocket.Server({ server: httpServer });

  wss.on("connection", (ws, req) => {
    console.log("🔌 WebSocket connected");

    ws.on("message", async (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        const { type, payload } = parsed;

        if (!type) {
          ws.send(
            JSON.stringify({
              type: "ERROR",
              payload: { message: "Missing message type" },
            })
          );
          return;
        }

        const handler = wsRoutes[type];

        if (!handler) {
          ws.send(
            JSON.stringify({
              type: "ERROR",
              payload: { message: `Unknown WS route: ${type}` },
            })
          );
          return;
        }

        await handler(ws, payload);
      } catch (err) {
        console.error("WS message error:", err);
        ws.send(
          JSON.stringify({
            type: "ERROR",
            payload: { message: "Invalid WS message format" },
          })
        );
      }
    });

    ws.on("close", () => {
      console.log("WebSocket disconnected");
    });
  });

  console.log("WebSocket server initialized");
  return wss;
}

module.exports = initWebSocketServer;
