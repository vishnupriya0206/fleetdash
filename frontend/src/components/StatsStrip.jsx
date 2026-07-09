import React from 'react';
import { MapPin, Gauge, Clock } from 'lucide-react';

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

export default function StatsStrip({ distanceKm, avgSpeed, activeSeconds }) {
  return (
    <div className="stats-strip">
      <div className="stat">
        <span className="icon-wrap"><MapPin size={16} /></span>
        <div>
          <span className="label">Distance Today</span>
          <span className="value">{distanceKm.toFixed(1)} km</span>
        </div>
      </div>
      <div className="stat">
        <span className="icon-wrap"><Gauge size={16} /></span>
        <div>
          <span className="label">Avg Speed</span>
          <span className="value">{Math.round(avgSpeed)} kmph</span>
        </div>
      </div>
      <div className="stat">
        <span className="icon-wrap"><Clock size={16} /></span>
        <div>
          <span className="label">Active Time</span>
          <span className="value">{formatDuration(activeSeconds)}</span>
        </div>
      </div>
    </div>
  );
}
