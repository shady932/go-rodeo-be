require("newrelic");
require("dotenv").config();
const path = require("path");
const http = require("http");

const connectDB = async (db) => {
  try {
    await db.sequelize.authenticate();
    console.log("Connected to DB.");
  } catch (error) {
    console.error("Unable to connect to database: ", error);
    throw error;
  }
};

async function main() {
  const db = require("./database");
  await connectDB(db);

  const app = require("./server.js");

  // 🔑 Create HTTP server explicitly
  const httpServer = http.createServer(app);

  // 🔌 Attach WebSocket server
  require("./realtime/server.js")(httpServer);

  return httpServer;
}

main().then((server) => {
  const port = process.env.PORT || 8030;
  const logger = require("./core/lib/logger");

  server.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
});
