import React, { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
export default function SettingsView() {
const [form, setForm] = useState({
maxSpeed: 80,
fuelAlert: 20,
idleThreshold: 10,
overspeedThreshold: 90,
harshBraking: true,
gpsInterval: 5,
offlineTimeout: 30,
autoWeeklyReport: true,
exportFormat: 'PDF',
});
const [saved, setSaved] = useState(false);
function update(key, value) {
setForm((f) => ({ ...f, [key]: value }));
setSaved(false);
}
function handleSave() {
// Frontend-only for now - no persistence endpoint exists yet.
// POST `form` to something like /api/settings once the backend
// route + a Settings collection are added.
setSaved(true);
}
return (
<div className="settings-view">
<section className="settings-section">
<h3>Fleet Configuration</h3>
<div className="settings-row">
<label>Maximum speed limit (km/h)</label>
<input type="number" value={form.maxSpeed} onChange={(e) => update('maxSpeed', e.target.value)} />
</div>
<div className="settings-row">
<label>Default fuel alert level (%)</label>
<input type="number" value={form.fuelAlert} onChange={(e) => update('fuelAlert', e.target.value)} />
</div>
<div className="settings-row">
<label>Idle time threshold (minutes)</label>
<input type="number" value={form.idleThreshold} onChange={(e) => update('idleThreshold', e.target.value)} />
</div>
</section>
<section className="settings-section">
<h3>Alert Rules</h3>
<div className="settings-row">
<label>Overspeed threshold (km/h)</label>
<input type="number" value={form.overspeedThreshold} onChange={(e) => update('overspeedThreshold', e.target.value)} />
</div>
<div className="settings-row">
<label>Harsh braking detection</label>
<input type="checkbox" checked={form.harshBraking} onChange={(e) => update('harshBraking', e.target.checked)} />
</div>
</section>
<section className="settings-section">
<h3>GPS & Tracking</h3>
<div className="settings-row">
<label>GPS update interval (sec)</label>
<input type="number" value={form.gpsInterval} onChange={(e) => update('gpsInterval', e.target.value)} />
</div>
<div className="settings-row">
<label>Offline timeout (sec)</label>
<input type="number" value={form.offlineTimeout} onChange={(e) => update('offlineTimeout', e.target.value)} />
</div>
</section>
<section className="settings-section">
<h3>Report Preferences</h3>
<div className="settings-row">
<label>Auto-generate weekly reports</label>
<input type="checkbox" checked={form.autoWeeklyReport} onChange={(e) => update('autoWeeklyReport', e.target.checked)} />
</div>
<div className="settings-row">
<label>Default export format</label>
<select value={form.exportFormat} onChange={(e) => update('exportFormat', e.target.value)}>
<option>PDF</option>
<option>Excel</option>
</select>
</div>
</section>
<button className="settings-save" onClick={handleSave}>
<SettingsIcon size={14} /> Save Settings
</button>
{saved && <span className="settings-saved-msg">Saved locally (this tab only)</span>}
<p className="modal-note">
These settings currently only live in the browser tab (React state) and reset on
refresh. To persist them, add a small Settings model plus a GET/POST /api/settings
route on the backend, and load/save `form` from there.
</p>
</div>
);
}