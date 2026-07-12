import React from 'react';
import Modal from './Modal.jsx';
import { Truck } from 'lucide-react';
import { nearestCity } from '../utils/nearestCity';
// Deterministic mock generator so each vehicle always shows the same
// driver / plate / fuel value instead of a new random one on every render.
function seededValue(seedStr, min, max) {
let hash = 0;
for (let i = 0; i < seedStr.length; i++) {
hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
}
return min + (hash % (max - min + 1));
}
const DRIVER_NAMES = [
'Ramesh Kumar', 'Suresh Patil', 'Arjun Singh', 'Vikram Rao',
'Manoj Yadav', 'Deepak Sharma', 'Anil Nair', 'Sanjay Gupta',
];
const STATE_CODES = ['TN', 'DL', 'MH', 'KA', 'WB', 'UP'];
function mockTruckNumber(vehicleId) {
const state = STATE_CODES[seededValue(vehicleId + 'state', 0, STATE_CODES.length - 1)];
const rto = String(seededValue(vehicleId + 'rto', 1, 99)).padStart(2, '0');
const letters = String.fromCharCode(
65 + seededValue(vehicleId + 'l1', 0, 25),
65 + seededValue(vehicleId + 'l2', 0, 25)
);
const num = seededValue(vehicleId + 'num', 1000, 9999);
return `${state} ${rto} ${letters} ${num}`;
}
function mockDriverName(vehicleId) {
return DRIVER_NAMES[seededValue(vehicleId + 'driver', 0, DRIVER_NAMES.length - 1)];
}
function mockFuelLevel(vehicleId, speed) {
const base = seededValue(vehicleId + 'fuel', 20, 95);
return Math.max(5, base - Math.round(speed / 20));
}
function statusLabel(status) {
if (status === 'offline') return 'Offline';
if (status === 'moving') return 'Moving';
return 'Idle';
}
export default function VehicleDetailModal({ vehicle, onClose }) {
if (!vehicle) return null;
const truckNumber = mockTruckNumber(vehicle.vehicleId);
const driverName = mockDriverName(vehicle.vehicleId);
const fuelLevel = mockFuelLevel(vehicle.vehicleId, vehicle.speed || 0);
const engineOn = vehicle.status !== 'offline';
const rows = [
['Vehicle ID', vehicle.vehicleId],
['Truck Number', truckNumber],
['Driver Name', driverName],
['Current Speed', `${Math.round(vehicle.speed || 0)} kmph`],
['Fuel Level', `${fuelLevel}%`],
['Engine Status', engineOn ? 'ON' : 'OFF'],
['GPS Location', `${vehicle.lat?.toFixed(4)}, ${vehicle.lng?.toFixed(4)}`],
['Route', `${nearestCity(vehicle.lat, vehicle.lng)} -> Next Hub`],
['Last Updated', vehicle.ts ? new Date(vehicle.ts).toLocaleTimeString('en-IN') : '-'],
['Vehicle Status', statusLabel(vehicle.status)],
];
return (
<Modal title={`Vehicle ${vehicle.vehicleId}`} icon={<Truck size={16} color="#3b82f6" />} onClose={onClose}>
<div className="detail-grid">
{rows.map(([label, value]) => (
<div className="detail-row" key={label}>
<span className="detail-label">{label}</span>
<span className="detail-value">{value}</span>
</div>
))}
</div>
<p className="modal-note">
Driver name, truck number, and fuel level are placeholder values generated on the
frontend. Wire them to real vehicle/driver records once that data exists in MongoDB.
</p>
</Modal>
);
}