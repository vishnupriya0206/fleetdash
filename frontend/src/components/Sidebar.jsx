import React from 'react';
import { Map, Truck, Bell, BarChart2, Settings } from 'lucide-react';

const items = [
  { key: 'map', label: 'Map', icon: Map },
  { key: 'vehicles', label: 'Vehicles', icon: Truck },
  { key: 'alerts', label: 'Alerts', icon: Bell },
  { key: 'reports', label: 'Reports', icon: BarChart2 },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <nav className="sidebar">
      {items.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          className={`nav-item${active === key ? ' active' : ''}`}
          onClick={() => onSelect(key)}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}
    </nav>
  );
}
