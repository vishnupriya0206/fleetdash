
const MAX_ALERTS = 50;

const latestByVehicle = new Map(); // vehicleId -> point
const recentAlerts = []; // newest first

function recordPoint(point) {
  latestByVehicle.set(point.vehicleId, point);
}

function recordAlert(evt) {
  recentAlerts.unshift(evt);
  if (recentAlerts.length > MAX_ALERTS) recentAlerts.pop();
}

function getAllLatest() {
  return Array.from(latestByVehicle.values());
}

function getRecentAlerts(limit = 20) {
  return recentAlerts.slice(0, limit);
}

module.exports = { recordPoint, recordAlert, getAllLatest, getRecentAlerts };
