/**
 * In-memory driver socket registry
 * { driverId: ws }
 */
class WsHub {
  constructor() {
    this.driverSockets = new Map();
    this.riderSockets = new Map();
  }

  registerDriver(driverId, ws) {
    this.driverSockets.set(String(driverId), ws);
  }
  registerRider(userId, ws) {
    this.riderSockets.set(String(userId), ws);
  }

  removeDriver(driverId) {
    this.driverSockets.delete(String(driverId));
  }
  removeRider(userId) {
    this.riderSockets.delete(String(userId));
  }

  sendToDriver(driverId, message) {
    const ws = this.driverSockets.get(String(driverId));
    if (!ws || ws.readyState !== ws.OPEN) return;

    ws.send(JSON.stringify(message));
    console.log(message);
  }

  sendToUser(userId, message) {
    const ws = this.riderSockets.get(String(userId));
    if (!ws || ws.readyState !== ws.OPEN) return;

    ws.send(JSON.stringify(message));
    console.log(message);
  }
}

module.exports = new WsHub();
