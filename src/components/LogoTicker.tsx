import React from 'react';
import './LogoTicker.css';

const logos = [
  { name: 'Acme Corp', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2z"/></svg> },
  { name: 'Quantum', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/></svg> },
  { name: 'Echo', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg> },
  { name: 'Celestia', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99z"/></svg> },
  { name: 'Pulse', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg> },
  { name: 'Apex', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2V7h2v10z"/></svg> },
  { name: 'Nexus', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2 0v20c5.07-.5 9-4.79 9-10s-3.93-9.5-9-10z"/></svg> },
  { name: 'Horizon', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg> }
];

export default function LogoTicker() {
  return (
    <div className="logo-ticker-container">
      <p className="logo-ticker-title">TRUSTED BY INDUSTRY LEADERS</p>
      <div className="logo-ticker-track-wrapper">
        <div className="logo-ticker-track">
          {/* Duplicate the array twice more to make the infinite scroll smooth */}
          {[...logos, ...logos, ...logos].map((logo, index) => (
            <div key={index} className="logo-ticker-item">
              <div className="logo-icon">{logo.icon}</div>
              <span className="logo-text">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
