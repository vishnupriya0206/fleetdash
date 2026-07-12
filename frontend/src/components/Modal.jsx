import React from 'react';
import { X } from 'lucide-react';
export default function Modal({ title, onClose, children, icon }) {
return (
<div className="modal-overlay" onClick={onClose}>
<div className="modal-box" onClick={(e) => e.stopPropagation()}>
<div className="modal-header">
<div className="modal-title">
{icon}
{title}
</div>
<button className="modal-close" onClick={onClose}>
<X size={18} />
</button>
</div>
<div className="modal-body">
{children}
</div>
</div>
</div>
);
}