import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Radio } from 'lucide-react';

const STATUS_COLOR = {
  moving: '#3b82f6',
  online: '#22c55e',
  offline: '#ef4444',
};

// India's rough geographic center + a zoom level that keeps the
// whole country (and a bit of the neighbourhood) in frame.
const INDIA_CENTER = [22.9734, 78.6569];
const INDIA_ZOOM = 5;

function buildIcon(vehicleId, status) {
  const color = STATUS_COLOR[status] || STATUS_COLOR.online;
  const html = `
    <div class="truck-marker">
      <div class="label">${vehicleId}</div>
      <div class="ring" style="background:${color}22;"></div>
      <div class="puck" style="background:${color};box-shadow:0 0 14px ${color};">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0b1120" stroke-width="2.5">
          <path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/>
          <circle cx="5.5" cy="18.5" r="2.5" fill="#0b1120"/>
          <circle cx="18.5" cy="18.5" r="2.5" fill="#0b1120"/>
        </svg>
      </div>
    </div>`;
  return L.divIcon({
    html,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export default function MapView({ vehicles }) {
  const markers = useMemo(
    () =>
      vehicles.map((v) => ({
        ...v,
        icon: buildIcon(v.vehicleId, v.status),
      })),
    [vehicles]
  );

  return (
    <div className="map-col">
      <div className="live-pill">
        <span className="live-dot" />
        <Radio size={12} />
        LIVE TRACKING
      </div>

      <MapContainer
        center={INDIA_CENTER}
        zoom={INDIA_ZOOM}
        minZoom={4}
        maxBounds={[[2, 62], [38, 100]]}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {markers.map((v) => (
          <Marker key={v.vehicleId} position={[v.lat, v.lng]} icon={v.icon}>
            <Tooltip direction="top" offset={[0, -14]}>
              <strong>{v.vehicleId}</strong> — {Math.round(v.speed)} kmph
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      <div className="status-legend">
        <h4>VEHICLE STATUS</h4>
        <div className="legend-row">
          <span className="legend-dot" style={{ background: STATUS_COLOR.online }} /> Online
        </div>
        <div className="legend-row">
          <span className="legend-dot" style={{ background: STATUS_COLOR.moving }} /> Moving
        </div>
        <div className="legend-row">
          <span className="legend-dot" style={{ background: STATUS_COLOR.offline }} /> Offline
        </div>
      </div>
    </div>
  );
}
