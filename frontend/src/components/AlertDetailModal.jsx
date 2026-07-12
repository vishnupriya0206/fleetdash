import React from 'react';
import Modal from './Modal.jsx';
import { AlertTriangle } from 'lucide-react';
const ALERT_META = {
SPEED: {
emoji: 'RED', label: 'Overspeed', color: '#ef4444',
describe: (a) => `Vehicle ${a.vehicleId} exceeded ${a.speed || 90} km/h.`,
},
EXIT: {
emoji: 'YELLOW', label: 'Geofence Exit', color: '#eab308',
describe: (a) => `Vehicle ${a.vehicleId} left ${a.zoneName || 'the allowed area'}.`,
},
ENTER: {
emoji: 'GREEN', label: 'Geofence Entry', color: '#22c55e',
describe: (a) => `Vehicle ${a.vehicleId} entered ${a.zoneName || 'a monitored zone'}.`,
},
LOW_FUEL: {
emoji: 'ORANGE', label: 'Low Fuel', color: '#f97316',
describe: (a) => `Vehicle ${a.vehicleId} fuel below 15%.`,
},
MAINTENANCE: {
emoji: 'BLUE', label: 'Maintenance Due', color: '#3b82f6',
describe: (a) => `Vehicle ${a.vehicleId} service due in 3 days.`,
},
OFFLINE: {
emoji: 'BLACK', label: 'Vehicle Offline', color: '#6b7280',
describe: (a) => `Vehicle ${a.vehicleId} has no GPS signal for 10 minutes.`,
},
};
export default function AlertDetailModal({ alert, onClose }) {
if (!alert) return null;
const meta = ALERT_META[alert.type] || {
emoji: 'DOT', label: alert.type || 'Status Change', color: '#8b96ac',
describe: (a) => `Vehicle ${a.vehicleId} status changed.`,
};
return (
<Modal title={meta.label} icon={<AlertTriangle size={16} color={meta.color} />} onClose={onClose}>
<div className="alert-detail-body">
<p className="alert-detail-desc">{meta.describe(alert)}</p>
<div className="detail-grid">
<div className="detail-row">
<span className="detail-label">Vehicle</span>
<span className="detail-value">{alert.vehicleId}</span>
</div>
<div className="detail-row">
<span className="detail-label">Alert Type</span>
<span className="detail-value">{meta.label}</span>
</div>
<div className="detail-row">
<span className="detail-label">Time</span>
<span className="detail-value">
{alert.at ? new Date(alert.at).toLocaleTimeString('en-IN') : '-'}
</span>
</div>
</div>
</div>
<p className="modal-note">
Low Fuel, Maintenance Due, and Vehicle Offline are ready to render here. The backend
geofence engine currently only emits ENTER / EXIT / SPEED events (see geofence.js) -
hook up those extra event sources server-side when you're ready to trigger them.
</p>
</Modal>
);
}