

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const os = require('os');
const { Server } = require('socket.io');
const { Worker } = require('worker_threads');
const mongoose = require('mongoose');
const Redis = require('ioredis');

const TelemetryBucket = require('./models/TelemetryBucket');
const { checkBreaches, geofences } = require('./geofence');
const { getOrCreateId, getFullRegistry } = require('./vehicleRegistry');
const liveStore = require('./liveStore');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// ---------- Redis Pub/Sub ----------
// Two connections are required: ioredis (and Redis in general) does
// not allow a client in "subscribe mode" to also issue normal commands.
const redisPub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const redisSub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const TELEMETRY_CHANNEL = 'fleet:telemetry';
const ALERT_CHANNEL = 'fleet:alerts';

redisSub.subscribe(TELEMETRY_CHANNEL, ALERT_CHANNEL);
redisSub.on('message', (channel, message) => {
  const payload = JSON.parse(message);
  if (channel === TELEMETRY_CHANNEL) {
    io.emit('telemetry:batch', encodeBinaryBatch(payload));
  } else if (channel === ALERT_CHANNEL) {
    io.emit('geofence:alert', payload);
    liveStore.recordAlert(payload);
  }
});

// ---------- Binary transport ----------
// Instead of shipping [{vehicleId, lat, lng, ...}, ...] as JSON text
// (verbose, slow to parse at high frequency), we pack each point into
// a fixed-width binary record: this is what lets the frontend stay
// smooth at thousands of updates/sec.
//
// NOTE: the original version of this packed vehicleId through a
// one-way hash. That's fine for writing bytes but impossible to
// reverse on the frontend, so a decoded point could never be matched
// back to "FD-101". Fixed here by using small sequential registry
// ids instead of a hash — see vehicleRegistry.js.
function encodeBinaryBatch(points) {
  // Layout per point: registry id (4 bytes) + lat (8) + lng (8) +
  // speed (4) + heading (4) = 28 bytes/point.
  const buffer = new ArrayBuffer(points.length * 28);
  const view = new DataView(buffer);
  const newEntries = {};

  points.forEach((p, i) => {
    const { numericId, isNew } = getOrCreateId(p.vehicleId);
    if (isNew) newEntries[p.vehicleId] = numericId;

    const offset = i * 28;
    view.setUint32(offset, numericId);
    view.setFloat64(offset + 4, p.lat);
    view.setFloat64(offset + 12, p.lng);
    view.setFloat32(offset + 20, p.speed || 0);
    view.setFloat32(offset + 24, p.heading || 0);
  });

  // Tell already-connected dashboards about any brand-new vehicleIds
  // so they can resolve future binary frames without a REST refetch.
  if (Object.keys(newEntries).length > 0) {
    io.emit('registry:update', newEntries);
  }

  return buffer;
}

// ---------- Worker pool ----------
// A simple round-robin pool sized to the CPU core count. Each worker
// is a long-lived thread (spawning a new one per request would be too
// slow); we just keep handing it batches to parse.
const POOL_SIZE = Math.max(2, os.cpus().length - 1);
const pool = [];
let nextWorker = 0;

for (let i = 0; i < POOL_SIZE; i++) {
  const worker = new Worker(path.join(__dirname, 'worker.js'));
  pool.push(worker);
}

function parseWithPool(batch) {
  return new Promise((resolve) => {
    const worker = pool[nextWorker];
    nextWorker = (nextWorker + 1) % POOL_SIZE;

    const onMessage = (cleaned) => {
      worker.off('message', onMessage);
      resolve(cleaned);
    };
    worker.on('message', onMessage);
    worker.postMessage(batch);
  });
}

// ---------- Ingestion endpoint ----------
app.post('/ingest', async (req, res) => {
  const batch = Array.isArray(req.body.points) ? req.body.points : [];
  if (batch.length === 0) {
    return res.status(400).json({ error: 'points[] required' });
  }

  // 1. Offload parsing/validation to a worker thread.
  const cleaned = await parseWithPool(batch);

  // 2. Persist using the bucket pattern (fire-and-forget per point is
  //    fine here since bulkWrite batches them; kept simple for clarity).
  const bulkOps = cleaned.map((p) => ({
    updateOne: {
      filter: {
        vehicleId: p.vehicleId,
        bucketHour: new Date(new Date(p.ts).setMinutes(0, 0, 0)),
      },
      update: {
        $push: { points: p },
        $inc: { pointCount: 1 },
        $setOnInsert: { vehicleId: p.vehicleId },
      },
      upsert: true,
    },
  }));
  if (bulkOps.length && mongoose.connection.readyState === 1) {
    TelemetryBucket.bulkWrite(bulkOps).catch(console.error);
  }

  // 3. Update the latest-position cache and run geofence checks.
  for (const p of cleaned) {
    liveStore.recordPoint(p);
    const events = checkBreaches(p);
    for (const evt of events) {
      redisPub.publish(ALERT_CHANNEL, JSON.stringify(evt));
    }
  }

  // 4. Publish the cleaned batch for real-time broadcast.
  if (cleaned.length) {
    redisPub.publish(TELEMETRY_CHANNEL, JSON.stringify(cleaned));
  }

  res.json({ accepted: cleaned.length, rejected: batch.length - cleaned.length });
});

// ---------- Dashboard REST endpoints ----------
// Read-model endpoints so the dashboard has data to paint immediately
// on load, before any socket ticks arrive.
app.get('/api/vehicles', (_req, res) => {
  res.json({ vehicles: liveStore.getAllLatest() });
});

app.get('/api/alerts', (_req, res) => {
  const limit = Number(_req.query.limit) || 20;
  res.json({ alerts: liveStore.getRecentAlerts(limit) });
});

app.get('/api/registry', (_req, res) => {
  res.json({ registry: getFullRegistry() });
});

app.get('/api/geofences', (_req, res) => {
  res.json({
    zones: geofences.map((z) => ({ id: z.id, name: z.name })),
  });
});

app.get('/health', (_req, res) => res.json({ status: 'ok', workers: POOL_SIZE }));

// ---------- Bootstrap ----------
async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fleetdash');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.warn('MongoDB not available, continuing without persistence:', err.message);
  }
  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => console.log(`FleetDash backend listening on :${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start FleetDash backend:', err);
  process.exit(1);
});

module.exports = { app, server, io };
