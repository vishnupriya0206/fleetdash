import React, { useState } from 'react';
const TABS = ['Vehicle Usage', 'Fuel Report', 'Speed Report', 'Driver Report', 'Maintenance Report'];
function formatDuration(seconds) {
const h = Math.floor(seconds / 3600);
const m = Math.floor((seconds % 3600) / 60);
return `${h}h ${m}m`;
}
export default function ReportsView({ vehicles, distanceKm, avgSpeed, activeSeconds, alerts }) {
const [tab, setTab] = useState(TABS[0]);
const maxSpeed = vehicles.length ? Math.max(...vehicles.map((v) => v.speed || 0)) : 0;
const violations = alerts.filter((a) => a.type === 'SPEED').length;
return (
<div className="reports-view">
<div className="reports-tabs">
{TABS.map((t) => (
<button
key={t}
className={`reports-tab${tab === t ? ' active' : ''}`}
onClick={() => setTab(t)}
>
{t}
</button>
))}
</div>
<div className="reports-content">
{tab === 'Vehicle Usage' && (
<div className="reports-card-grid">
<div className="reports-card"><span className="label">Distance Travelled</span><span className="value">{distanceKm.toFixed(1)} km</span></div>
<div className="reports-card"><span className="label">Driving Hours</span><span className="value">{formatDuration(activeSeconds)}</span></div>
<div className="reports-card"><span className="label">Stops</span><span className="value">{vehicles.filter((v) => v.status === 'online').length}
</span></div>
</div>
)}
{tab === 'Fuel Report' && (
<div className="reports-card-grid">
<div className="reports-card"><span className="label">Fuel Consumed (est.)</span><span className="value">{(distanceKm * 0.28).toFixed(1)}
L</span></div>
<div className="reports-card"><span className="label">Fuel Efficiency</span><span className="value">3.5 km/L</span></div>
</div>
)}
{tab === 'Speed Report' && (
<div className="reports-card-grid">
<div className="reports-card"><span className="label">Average Speed</span><span className="value">{Math.round(avgSpeed)} kmph</span></div>
<div className="reports-card"><span className="label">Maximum Speed</span><span className="value">{Math.round(maxSpeed)} kmph</span></div>
</div>
)}
{tab === 'Driver Report' && (
<div className="reports-card-grid">
<div className="reports-card"><span className="label">Trips Completed</span><span className="value">{vehicles.length}</span></div>
<div className="reports-card"><span className="label">Violations</span><span className="value">{violations}</span></div>
</div>
)}
{tab === 'Maintenance Report' && (
<div className="reports-card-grid">
<div className="reports-card"><span className="label">Service History</span><span className="value">Up to date</span></div>
<div className="reports-card"><span className="label">Next Service Due</span><span className="value">In 10 days</span></div>
</div>
)}
</div>
<p className="modal-note reports-note">
Fuel, driver-trip, and maintenance figures are estimated from live telemetry.
Connect a real fuel-sensor feed and a maintenance-log collection on the backend
for exact numbers.
</p>
</div>
);
}
