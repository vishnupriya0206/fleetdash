

const idToVehicle = new Map(); // numericId -> vehicleId
const vehicleToId = new Map(); // vehicleId -> numericId
let nextId = 1;

/** Returns the numeric id for a vehicleId, assigning one if new.
 *  Returns { numericId, isNew } so callers can decide whether to
 *  broadcast a registry update. */
function getOrCreateId(vehicleId) {
  let numericId = vehicleToId.get(vehicleId);
  if (numericId !== undefined) {
    return { numericId, isNew: false };
  }
  numericId = nextId++;
  vehicleToId.set(vehicleId, numericId);
  idToVehicle.set(numericId, vehicleId);
  return { numericId, isNew: true };
}

function getVehicleId(numericId) {
  return idToVehicle.get(numericId);
}

/** Full snapshot, e.g. for a REST endpoint the frontend hits once on load. */
function getFullRegistry() {
  const out = {};
  for (const [vehicleId, numericId] of vehicleToId.entries()) {
    out[vehicleId] = numericId;
  }
  return out;
}

module.exports = { getOrCreateId, getVehicleId, getFullRegistry };
