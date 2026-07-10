import React, { useEffect, useRef, useState, useCallback } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import MapView from './components/MapView.jsx';
import AlertsPanel from './components/AlertsPanel.jsx';
import VehicleList from './components/VehicleList.jsx';
import StatsStrip from './components/StatsStrip.jsx';
import FooterBar from './components/FooterBar.jsx';
import VehiclePage from "./pages/VehiclePage.jsx";
import { socket, API_URL } from './socket.js';
import { decodeBinaryBatch } from './utils/decodeBinary.js';
import { haversineKm } from './utils/geo.js';

const OFFLINE_AFTER_MS = 30_000;
const MOVING_SPEED_KMPH = 8;

export default function App() {
  const [vehicles, setVehicles] = useState({}); // vehicleId -> point+status
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(socket.connected);
  const [activeNav, setActiveNav] = useState('map');

  const registryRef = useRef(new Map()); // numericId -> vehicleId
  const distanceRef = useRef(0); // accumulated km, demo "distance today"
  const mountTimeRef = useRef(Date.now());
  const [activeSeconds, setActiveSeconds] = useState(0);

  const deriveStatus = useCallback((point) => {
    const age = Date.now() - point.ts;
    if (age > OFFLINE_AFTER_MS) return 'offline';
    return point.speed >= MOVING_SPEED_KMPH ? 'moving' : 'online';
  }, []);

  const applyPoints = useCallback(
    (points) => {
      setVehicles((prev) => {
        const next = { ...prev };
        for (const p of points) {
          const previous = next[p.vehicleId];
          if (previous) {
            distanceRef.current += haversineKm(previous.lat, previous.lng, p.lat, p.lng);
          }
          next[p.vehicleId] = { ...p, status: deriveStatus(p) };
        }
        return next;
      });
    },
    [deriveStatus]
  );

  // ---------- Bootstrap from REST, then attach socket listeners ----------
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const [regRes, vehRes, alertRes] = await Promise.all([
          fetch(`${API_URL}/api/registry`).then((r) => r.json()),
          fetch(`${API_URL}/api/vehicles`).then((r) => r.json()),
          fetch(`${API_URL}/api/alerts?limit=20`).then((r) => r.json()),
        ]);
        if (cancelled) return;

        for (const [vehicleId, numericId] of Object.entries(regRes.registry || {})) {
          registryRef.current.set(numericId, vehicleId);
        }
        applyPoints(vehRes.vehicles || []);
        setAlerts(alertRes.alerts || []);
      } catch (err) {
        console.warn('Bootstrap fetch failed:', err.message);
      }
    }
    bootstrap();

    function onBinaryBatch(buffer) {
      const points = decodeBinaryBatch(buffer, registryRef.current);
      applyPoints(points);
    }
    function onAlert(evt) {
      setAlerts((prev) => [evt, ...prev].slice(0, 50));
    }
    function onRegistryUpdate(newEntries) {
      for (const [vehicleId, numericId] of Object.entries(newEntries)) {
        registryRef.current.set(numericId, vehicleId);
      }
    }
    function onConnect() { setConnected(true); }
    function onDisconnect() { setConnected(false); }

    socket.on('telemetry:batch', onBinaryBatch);
    socket.on('geofence:alert', onAlert);
    socket.on('registry:update', onRegistryUpdate);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
     return () => {
      cancelled = true;
      socket.off('telemetry:batch', onBinaryBatch);
      socket.off('geofence:alert', onAlert);
      socket.off('registry:update', onRegistryUpdate);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
    
  }, [applyPoints]);

  // Periodically re-derive status so vehicles age into "offline"
  // even if no new point arrives, and tick the active-time clock.
  useEffect(() => {
    const t = setInterval(() => {
      setVehicles((prev) => {
        const next = {};
        for (const [id, v] of Object.entries(prev)) {
          next[id] = { ...v, status: deriveStatus(v) };
        }
        return next;
      });
      setActiveSeconds(Math.floor((Date.now() - mountTimeRef.current) / 1000));
    }, 5000);
    return () => clearInterval(t);
  }, [deriveStatus]);

  const vehicleArr = Object.values(vehicles);
  const totalVehicles = vehicleArr.length;
  const onlineCount = vehicleArr.filter((v) => v.status !== 'offline').length;
  const movingCount = vehicleArr.filter((v) => v.status === 'moving').length;
  const avgSpeed = vehicleArr.length
    ? vehicleArr.reduce((sum, v) => sum + v.speed, 0) / vehicleArr.length
    : 0;

  return (
    <div className="app-shell">
      <Header
        totalVehicles={totalVehicles}
        online={onlineCount}
        moving={movingCount}
        alertCount={alerts.length}
      />

      <div className="body-row">
        <Sidebar active={activeNav} onSelect={setActiveNav} />

        <div className="main-columns">
          <MapView vehicles={vehicleArr} />

          <div className="right-col">
            <AlertsPanel alerts={alerts} />
            <VehicleList vehicles={vehicleArr} />
            <StatsStrip
              distanceKm={distanceRef.current}
              avgSpeed={avgSpeed}
              activeSeconds={activeSeconds}
            />
          </div>
        </div>
      </div>

      <FooterBar connected={connected} />
    </div>
  );
}
