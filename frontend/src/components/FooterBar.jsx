import React from 'react';

export default function FooterBar({ connected }) {
  return (
    <footer className="footer-bar">
      <div className="footer-status">
        <span className="footer-dot" style={{ background: connected ? '#22c55e' : '#ef4444' }} />
        System Status: {connected ? 'All Systems Operational' : 'Reconnecting…'}
      </div>
      <div>FleetDash © {new Date().getFullYear()} &nbsp;|&nbsp; All rights reserved</div>
    </footer>
  );
}
