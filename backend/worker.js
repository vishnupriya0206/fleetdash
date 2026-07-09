

const { parentPort } = require('worker_threads');
function validateAndNormalize(raw) {
  const { vehicleId, lat, lng, speed, heading, ts } = raw;

  if (
    typeof vehicleId !== 'string' ||
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    lat < -90 || lat > 90 ||
    lng < -180 || lng > 180
  ) {
    return null; // drop malformed pings rather than crash the pipeline
  }

  return {
    vehicleId,
    lat,
    lng,
    speed: typeof speed === 'number' ? speed : 0,
    heading: typeof heading === 'number' ? heading : 0,
    ts: ts || Date.now(),
  };
}

// The main thread posts an array of raw pings; we parse them all here.
parentPort.on('message', (batch) => {
  const cleaned = [];
  for (const raw of batch) {
    const point = validateAndNormalize(raw);
    if (point) cleaned.push(point);
  }
  // Send the cleaned batch back to the main thread for broadcasting.
  parentPort.postMessage(cleaned);
});
