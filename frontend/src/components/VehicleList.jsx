import React from 'react';
import { List, Wifi } from 'lucide-react';
import { nearestCity } from '../utils/nearestCity';

const STATUS_COLOR = {
  moving: '#3b82f6',
  online: '#22c55e',
  offline: '#ef4444',
};

export default function VehicleList({ vehicles }) {
  return (
    <div className="panel vehicle-panel">
      <div className="panel-header">
        <div className="panel-title">
          <List size={16} color="#3b82f6" />
          VEHICLE LIST
        </div>
      </div>

      <div className="vehicle-list">
        {vehicles.length === 0 && (
          <div style={{ color: 'var(--text-faint)', fontSize: 12 }}>Waiting for telemetry…</div>
        )}
        {vehicles.map((v) => (
          <div key={v.vehicleId} className="vehicle-row">
            <span className="vehicle-dot" style={{ background: STATUS_COLOR[v.status] }} />
            <div className="vehicle-info">
              <div className="vehicle-id">{v.vehicleId}</div>
              <div className="vehicle-loc">{nearestCity(v.lat, v.lng)}</div>
            </div>
            <span className="vehicle-speed" style={{ color: STATUS_COLOR[v.status] }}>
              {Math.round(v.speed)} kmph
            </span>
            <Wifi size={13} color={v.status === 'offline' ? '#ef4444' : '#22c55e'} />
          </div>
        ))}
      </div>
    </div>
  );
}
