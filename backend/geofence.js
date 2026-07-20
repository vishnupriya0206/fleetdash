
const turf = require('@turf/turf');
function box(id, name, [minLng, minLat, maxLng, maxLat]) {
  return {
    id,
    name,
    polygon: turf.polygon([[
      [minLng, minLat], [maxLng, minLat], [maxLng, maxLat], [minLng, maxLat], [minLng, minLat],
    ]]),
  };
}

const geofences = [
  box('zone-delhi-hub', 'Delhi NCR Depot', [76.95, 28.35, 77.45, 28.85]),
  box('zone-mumbai-hub', 'Mumbai Port Zone', [72.75, 18.85, 73.05, 19.20]),
  box('zone-bengaluru-hub', 'Bengaluru Tech Park Zone', [77.45, 12.85, 77.75, 13.10]),
  box('zone-chennai-hub', 'Chennai Warehouse Zone', [80.10, 12.85, 80.35, 13.15]),
  box('zone-kolkata-hub', 'Kolkata Distribution Zone', [88.25, 22.45, 88.50, 22.70]),
];

// Tracks last known inside/outside state per vehicle per zone,
// so we only fire an alert on the *transition*, not on every tick.
const vehicleZoneState = new Map(); // key: `${vehicleId}:${zoneId}` -> boolean

function checkBreaches(point) {
  const { vehicleId, lat, lng } = point;
  const pt = turf.point([lng, lat]);
  const events = [];

  for (const zone of geofences) {
    const key = `${vehicleId}:${zone.id}`;
    const isInside = turf.booleanPointInPolygon(pt, zone.polygon);
    const wasInside = vehicleZoneState.get(key) || false;

    if (isInside !== wasInside) {
      events.push({
        vehicleId,
        zoneId: zone.id,
        zoneName: zone.name,
        type: isInside ? 'ENTER' : 'EXIT',
        at: point.ts,
      });
    }
    vehicleZoneState.set(key, isInside);
  }

  return events; 
}

module.exports = { checkBreaches, geofences };
