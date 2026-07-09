
const INGEST_URL = process.env.INGEST_URL || 'http://localhost:4000/ingest';

// Starting points for a handful of trucks spread across India,
// instead of the original demo's single Tamil Nadu cluster.
const vehicles = [
  { vehicleId: 'FD-101', lat: 28.6139, lng: 77.2090, heading: 45 },  // Delhi
  { vehicleId: 'FD-102', lat: 19.0760, lng: 72.8777, heading: 90 },  // Mumbai
  { vehicleId: 'FD-103', lat: 13.0827, lng: 80.2707, heading: 180 }, // Chennai
  { vehicleId: 'FD-104', lat: 12.9716, lng: 77.5946, heading: 270 }, // Bengaluru
  { vehicleId: 'FD-105', lat: 22.5726, lng: 88.3639, heading: 0 },   // Kolkata
];

function randomWalk(v) {
  // Small random drift + a bit of forward bias along the heading,
  // just enough motion to look alive on the map.
  const rad = (v.heading * Math.PI) / 180;
  const step = 0.004; // roughly a few hundred meters per tick
  v.lat += Math.cos(rad) * step + (Math.random() - 0.5) * 0.002;
  v.lng += Math.sin(rad) * step + (Math.random() - 0.5) * 0.002;
  v.heading = (v.heading + (Math.random() - 0.5) * 20 + 360) % 360;
  return {
    vehicleId: v.vehicleId,
    lat: Number(v.lat.toFixed(6)),
    lng: Number(v.lng.toFixed(6)),
    speed: Math.round(40 + Math.random() * 50),
    heading: Math.round(v.heading),
    ts: Date.now(),
  };
}

async function tick() {
  const points = vehicles.map(randomWalk);
  try {
    const res = await fetch(INGEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points }),
    });
    const data = await res.json();
    console.log(`ingested ${data.accepted}, rejected ${data.rejected}`);
  } catch (err) {
    console.error('ingest failed:', err.message);
  }
}

console.log(`Simulating ${vehicles.length} vehicles -> ${INGEST_URL}`);
setInterval(tick, 2000);
tick();
