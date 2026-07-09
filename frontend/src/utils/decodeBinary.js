/**
 * decodeBinary.js
 * ---------------
 * Mirrors server.js's encodeBinaryBatch: each point is 28 bytes —
 * registry id (uint32) + lat (float64) + lng (float64) +
 * speed (float32) + heading (float32).
 *
 * The `registry` map (numericId -> vehicleId) must be kept in sync
 * with the backend. It's fetched once via GET /api/registry on load,
 * then patched incrementally via the 'registry:update' socket event
 * whenever the backend assigns an id to a vehicle it hasn't seen
 * before.
 */
const RECORD_SIZE = 28;

export function decodeBinaryBatch(buffer, registry) {
  const view = new DataView(buffer);
  const count = buffer.byteLength / RECORD_SIZE;
  const points = [];

  for (let i = 0; i < count; i++) {
    const offset = i * RECORD_SIZE;
    const numericId = view.getUint32(offset);
    const vehicleId = registry.get(numericId) || `unknown-${numericId}`;
    points.push({
      vehicleId,
      lat: view.getFloat64(offset + 4),
      lng: view.getFloat64(offset + 12),
      speed: view.getFloat32(offset + 20),
      heading: view.getFloat32(offset + 24),
      ts: Date.now(),
    });
  }
  return points;
}
