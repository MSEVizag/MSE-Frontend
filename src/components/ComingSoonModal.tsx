"use client";

import React, { useEffect, useState } from 'react';
import './ComingSoonModal.css';

export default function ComingSoonModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Set target date to August 25th of the current year
    const targetDate = new Date(`August 25, ${new Date().getFullYear()} 00:00:00`).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };

    updateTimer(); // Initial call to avoid 1s delay
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-coming-soon', handleOpen);
    return () => window.removeEventListener('open-coming-soon', handleOpen);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsOpen(false)}>
      <div className="modal-content" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
        
        {/* Left Side: Image */}
        <div className="modal-left">
          <div className="modal-tag">
            <span className="orange-line"></span> PREMIUM FLEET
          </div>
          <h2 className="modal-brand">Safari & Boshco</h2>
        </div>

        {/* Right Side: Content */}
        <div className="modal-right">
          <button className="btn-close" onClick={() => setIsOpen(false)}>
            <i className="ri-close-line"></i>
          </button>
          
          <div className="modal-header-logo">
            <h3>MS Engineering</h3>
            <div className="orange-underline"></div>
          </div>

          <h1 className="modal-title">Next-Gen Construction Machinery Launching Soon</h1>
          <p className="modal-desc">
            We are expanding our fleet with advanced Safari & Boshco equipment. Stay tuned for the reveal of our most powerful industrial assets yet.
          </p>

          <div className="countdown-timer" style={{ marginBottom: 'auto' }}>
            <div className="time-box">
              <span className="time-number">{timeLeft.days}</span>
              <span className="time-label">DAYS</span>
            </div>
            <div className="time-box">
              <span className="time-number">{timeLeft.hours}</span>
              <span className="time-label">HOURS</span>
            </div>
            <div className="time-box">
              <span className="time-number">{timeLeft.minutes}</span>
              <span className="time-label">MINS</span>
            </div>
            <div className="time-box highlight-box">
              <span className="time-number">{timeLeft.seconds}</span>
              <span className="time-label">SECS</span>
            </div>
          </div>

          <div className="modal-footer-status">
            <span className="status-dot"></span> Live Integration Active <span className="divider">|</span> Fleet Sync: v.2.4.0
          </div>
        </div>

      </div>
    </div>
  );
}
