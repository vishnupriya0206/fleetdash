import React, { useEffect, useState } from 'react';
import { Truck, Moon } from 'lucide-react';

export default function Header({ totalVehicles, online, moving, alertCount }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <header className="header">
      <div className="brand">
        <div className="brand-icon">
          <Truck size={20} color="#fff" />
        </div>
        <div>
          <div className="brand-name">FleetDash</div>
          <div className="brand-tagline">Smart Fleet Monitoring</div>
        </div>
      </div>

      <div className="header-stats">
        <div className="stat-chip">
          <span className="stat-dot" style={{ background: '#3b82f6' }} />
          <div>
            <span className="stat-label">Total Vehicles</span>
            <span className="stat-value">{totalVehicles}</span>
          </div>
        </div>
        <div className="stat-chip">
          <span className="stat-dot" style={{ background: '#22c55e' }} />
          <div>
            <span className="stat-label">Online</span>
            <span className="stat-value">{online}</span>
          </div>
        </div>
        <div className="stat-chip">
          <span className="stat-dot" style={{ background: '#3b82f6' }} />
          <div>
            <span className="stat-label">Moving</span>
            <span className="stat-value">{moving}</span>
          </div>
        </div>
        <div className="stat-chip">
          <span className="stat-dot" style={{ background: '#ef4444' }} />
          <div>
            <span className="stat-label">Alerts</span>
            <span className="stat-value">{alertCount}</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="clock">
          <div className="clock-time">{time}</div>
          <div className="clock-date">{date}</div>
        </div>
        <div className="moon-btn">
          <Moon size={15} />
        </div>
      </div>
    </header>
  );
}
