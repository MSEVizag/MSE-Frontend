"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import ComingSoonModal from '../components/ComingSoonModal';
import LogoTicker from '../components/LogoTicker';

export default function Home() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new Event('open-coming-soon'));
  };

  return (
    <>
      <ComingSoonModal />
      {/* Background Grid Effect */}
      <div className="bg-grid"></div>

      <nav className="navbar">
        <div className="logo">
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>MS Engineering</h1>
          </Link>
        </div>
        <ul className="nav-links desktop-only">
          <li><Link href="/" className="active">Home</Link></li>
          <li><a href="#" onClick={handleComingSoon}>About</a></li>
          <li><a href="#" onClick={handleComingSoon}>Services</a></li>
          <li><a href="#" className="contact-btn" onClick={handleComingSoon}>Contact Us</a></li>
        </ul>
        <button className="mobile-menu-icon" onClick={() => setIsMobileNavOpen(true)}>
          <i className="ri-menu-line"></i>
        </button>
      </nav>

      {/* Mobile Nav Sidebar */}
      {/* Mobile Nav Sidebar */}
      <>
        <div className={`mobile-sidebar-overlay ${isMobileNavOpen ? 'open' : ''}`} onClick={() => setIsMobileNavOpen(false)}></div>
        <div className={`mobile-sidebar ${isMobileNavOpen ? 'open' : ''}`}>
          <button className="sidebar-close" onClick={() => setIsMobileNavOpen(false)}>
            <i className="ri-close-line"></i>
          </button>
          <div className="sidebar-links">
            <Link href="/">Home</Link>
            <a href="#" onClick={handleComingSoon}>About</a>
            <a href="#" onClick={handleComingSoon}>Services</a>
            <a href="#" className="contact-btn" onClick={handleComingSoon}>Contact Us</a>
          </div>
        </div>
      </>

      <main className="hero-container">
        <div className="bento-grid">
          
          {/* Main Hero Box */}
          <div className="bento-box hero-box">
            <div className="hero-content-wrapper">
              <div className="hero-content">
                <span className="tag">ENGINEERING EXCELLENCE</span>
                <h2>MS Engineering</h2>
                <p>Delivering industrial solutions that set the benchmark for structural integrity and operational efficiency across global markets.</p>
                <Link href="/catalog" className="btn-primary">EXPLORE CATALOG <i className="ri-arrow-right-line"></i></Link>
              </div>
              <div className="hero-images">
                <div className="image-card">
                  <img src="https://safariequipments.co.in/assets/images/products/Small/SAFARI-3000-M.jpg" alt="Mixer 1" />
                </div>
                <div className="image-card">
                  <img src="https://safariequipments.co.in/assets/images/products/Small/SAFARI-1000-HF.jpg" alt="Mixer 2" />
                </div>
                <div className="image-card">
                  <img src="https://safariequipments.co.in/assets/images/products/Small/JK-500WR.jpg" alt="Mini Crane" />
                </div>
              </div>
            </div>
          </div>

          {/* Partners Box */}
          <div className="bento-box partners-box">
            <div className="box-header">
              <h3>AUTHORIZED PARTNERS</h3>
              <i className="ri-verified-badge-line icon-badge"></i>
            </div>
            <div className="partners-grid" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr' }}>
              <a href="https://safariequipments.co.in/" target="_blank" rel="noopener noreferrer" className="partner-item">
                <img src="https://safariequipments.co.in/assets/images/logo.png" alt="Safari Equipments" style={{ maxWidth: '95%', maxHeight: '85%', objectFit: 'contain' }} />
              </a>
              <a href="https://boshco.in/" target="_blank" rel="noopener noreferrer" className="partner-item">
                <img src="https://boshco.in/images/logo.png" alt="Boshco" style={{ maxWidth: '95%', maxHeight: '85%', objectFit: 'contain' }} />
              </a>
            </div>
          </div>

          {/* Map Box */}
          <div className="bento-box map-box">
            <div className="city-info-top">
              <span className="city-name-small">Visakhapatnam</span>
              <div className="map-icon-small"><i className="ri-map-2-line"></i></div>
            </div>
            <iframe 
              src="https://maps.google.com/maps?q=MS+Engineering,+27-32-51,+75+Feet+Rd,+Visakhapatnam,+Andhra+Pradesh+530001&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

        </div>
      </main>

      <LogoTicker />

      <section className="stats-section">
        <div className="stat-item">
          <h2>25+</h2>
          <p>Years Experience</p>
        </div>
        <div className="stat-item">
          <h2>500+</h2>
          <p>Project Completions</p>
        </div>
        <div className="stat-item">
          <h2>12</h2>
          <p>Global Patents</p>
        </div>
        <div className="stat-item">
          <h2>100%</h2>
          <p>Safety Compliance</p>
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <div className="footer-brand">
            <h2>MS Engineering</h2>
            <p>Technical Precision. Absolute<br />Reliability.</p>
          </div>
          <div className="footer-links">
            <a href="#" onClick={handleComingSoon}>Privacy Policy</a>
            <a href="#" onClick={handleComingSoon}>Technical Specs</a>
            <a href="#" onClick={handleComingSoon}>Support</a>
            <a href="#" onClick={handleComingSoon}>Terms of Service</a>
          </div>
          <div className="footer-copyright">
            <p>&copy; 2024 MS Engineering. All rights<br />reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
