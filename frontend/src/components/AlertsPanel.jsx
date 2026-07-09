import React from 'react';
import { AlertTriangle, Filter } from 'lucide-react';

function timeLabel(ts) {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function describe(alert) {
  if (alert.type === 'ENTER') return `Entered ${alert.zoneName}`;
  if (alert.type === 'EXIT') return `Left ${alert.zoneName}`;
  if (alert.type === 'SPEED') return `Exceeded speed limit (${alert.speed} kmph)`;
  return alert.zoneName || 'Status changed';
}

export default function AlertsPanel({ alerts }) {
  return (
    <div className="panel alerts-panel">
      <div className="panel-header">
        <div className="panel-title">
          <AlertTriangle size={16} color="#ef4444" />
          LIVE ALERTS
        </div>
        <Filter size={14} color="#8b96ac" />
      </div>

      <div className="alerts-list">
        {alerts.length === 0 && (
          <div style={{ color: 'var(--text-faint)', fontSize: 12 }}>No alerts yet.</div>
        )}
        {alerts.slice(0, 6).map((a, i) => (
          <div key={i} className={`alert-card type-${a.type}`}>
            <div className="alert-top">
              <span className="alert-title">Vehicle {a.vehicleId}</span>
              <span className="alert-time">{timeLabel(a.at)}</span>
            </div>
            <div className="alert-desc">{describe(a)}</div>
          </div>
        ))}
      </div>

      {alerts.length > 6 && <button className="view-all">View all alerts →</button>}
    </div>
  );
}
