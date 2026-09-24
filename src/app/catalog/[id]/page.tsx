"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import catalogDataRaw from '../../../../public/data/catalog.json';
import ComingSoonModal from '../../../components/ComingSoonModal';
import QuoteModal from '../../../components/QuoteModal';
import { Product } from '../../../types';
import './product.css';

export default function ProductDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [productSearch, setProductSearch] = useState('');
  const catalogData = catalogDataRaw as Product[];
  const product = catalogData.find(p => p.id === id);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // WhatsApp Integration State
  const [showQRModal, setShowQRModal] = useState(false);
  const [waLink, setWaLink] = useState("");
  const BUSINESS_NUMBER = "917984627108"; // Placeholder business number

  const handleWhatsAppEnquiry = () => {
    const pageUrl = window.location.href;
    const message = `Hello MS Engineering, I am interested in ${product.title} (ID: ${product.id}).\n\nLink: ${pageUrl}`;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${BUSINESS_NUMBER}?text=${encodedMessage}`;

    // Check if device is mobile (approximate based on width)
    if (window.innerWidth <= 768) {
      window.location.href = url;
    } else {
      setWaLink(url);
      setShowQRModal(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Gallery Navigation State
  const thumbnails = product?.thumbnails || [product?.image];
  const [activeIdx, setActiveIdx] = useState(0);
  const activeImage = thumbnails[activeIdx];

  // Zoom State
  const [showZoom, setShowZoom] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [bgPos, setBgPos] = useState({ x: 0, y: 0 });
  const imgContainerRef = useRef<HTMLDivElement>(null);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev === 0 ? thumbnails.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev === thumbnails.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imgContainerRef.current) return;
    const { left, top, width, height } = imgContainerRef.current.getBoundingClientRect();

    let x = e.clientX - left;
    let y = e.clientY - top;

    const lensSize = 150; // Should match CSS width/height of .zoom-lens
    const halfLens = lensSize / 2;

    let lensX = x - halfLens;
    let lensY = y - halfLens;

    if (lensX < 0) lensX = 0;
    if (lensY < 0) lensY = 0;
    if (lensX > width - lensSize) lensX = width - lensSize;
    if (lensY > height - lensSize) lensY = height - lensSize;

    setLensPos({ x: lensX, y: lensY });

    // Calculate background position percentages
    const percentX = (lensX / (width - lensSize)) * 100;
    const percentY = (lensY / (height - lensSize)) * 100;

    setBgPos({ x: percentX, y: percentY });
  };

  if (!product) {
    return <div className="product-not-found">Product not found. <Link href="/catalog">Return to Catalog</Link></div>;
  }

  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new Event('open-coming-soon'));
  };

  const handleGetQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-quote-modal', {
      detail: { productId: product.id, productTitle: product.title }
    }));
  };

  return (
    <>
      <ComingSoonModal />
      <QuoteModal />

      {/* Reusing Landing Page Style Navbar (White Background) */}
      <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #eaeaea' }}>
        <div className="logo" style={{ flex: 1 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2>MS Engineering</h2>
          </Link>
        </div>
        
        <div className="nav-search-container desktop-only" style={{ flex: 2, display: 'flex', justifyContent: 'center' }}>
          <form onSubmit={(e) => { e.preventDefault(); if(productSearch.trim()) router.push(`/catalog?search=${encodeURIComponent(productSearch.trim())}`); }} style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <i className="ri-search-line" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }}></i>
            <input 
              type="text" 
              placeholder="Search catalog..." 
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 36px 12px 42px', borderRadius: '24px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', transition: 'all 0.2s' }}
              onFocus={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
              onBlur={(e) => { e.target.style.backgroundColor = '#f8fafc'; e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            />
            {productSearch && (
              <i 
                className="ri-close-circle-fill" 
                onClick={(e) => { e.preventDefault(); setProductSearch(''); }}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#cbd5e1', fontSize: '18px' }}
              ></i>
            )}
          </form>
        </div>

        <ul className="nav-links desktop-only" style={{ flex: 1, justifyContent: 'flex-end', whiteSpace: 'nowrap', alignItems: 'center', gap: '16px' }}>
          <li>
            <Link href="/catalog" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: '#64748b', fontSize: '14px', fontWeight: 500, padding: '8px 12px', borderRadius: '4px', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <i className="ri-arrow-left-line"></i> Back to Catalog
            </Link>
          </li>
          <li><a href="#" className="contact-btn" onClick={handleComingSoon} style={{ whiteSpace: 'nowrap' }}>Contact Us</a></li>
        </ul>
        <button className="mobile-menu-icon" onClick={() => setIsMobileNavOpen(true)}>
          <i className="ri-menu-line"></i>
        </button>
      </nav>

      {/* Mobile Nav Sidebar */}
      <>
        <div className={`mobile-sidebar-overlay ${isMobileNavOpen ? 'open' : ''}`} onClick={() => setIsMobileNavOpen(false)}></div>
        <div className={`mobile-sidebar ${isMobileNavOpen ? 'open' : ''}`}>
          <button className="sidebar-close" onClick={() => setIsMobileNavOpen(false)}>
            <i className="ri-close-line"></i>
          </button>
          <div className="sidebar-links">
            <Link href="/">Home</Link>
            <Link href="/catalog">Back to Catalog</Link>
            <a href="#" className="contact-btn" onClick={handleComingSoon}>Contact Us</a>
          </div>
        </div>
      </>

      <main className="product-detail-main">
        <div className="product-detail-container">

          {/* Top Section: Gallery and Info */}
          <div className="product-top-section">

            {/* Left: Gallery */}
            <div className="product-gallery">
              <div
                className="main-image-container"
                ref={imgContainerRef}
                onMouseEnter={() => setShowZoom(true)}
                onMouseLeave={() => setShowZoom(false)}
                onMouseMove={handleMouseMove}
              >
                <button className="gallery-nav-btn prev" onClick={handlePrev}>
                  <i className="ri-arrow-left-s-line"></i>
                </button>

                <img src={activeImage} alt={product.title} />

                {showZoom && (
                  <div className="zoom-lens" style={{ left: `${lensPos.x}px`, top: `${lensPos.y}px` }}></div>
                )}

                <button className="gallery-nav-btn next" onClick={handleNext}>
                  <i className="ri-arrow-right-s-line"></i>
                </button>
              </div>
              <div className="thumbnail-row">
                {thumbnails.map((thumb, idx) => (
                  <div
                    key={idx}
                    className={`thumbnail-box ${activeIdx === idx ? 'active' : ''}`}
                    onClick={() => setActiveIdx(idx)}
                  >
                    <img src={thumb} alt={`${product.title} view ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Zoom Result Window */}
            {showZoom && (
              <div className="zoom-result-window">
                <div
                  className="zoom-result-image"
                  style={{
                    backgroundImage: `url(${activeImage})`,
                    backgroundPosition: `${bgPos.x}% ${bgPos.y}%`
                  }}
                ></div>
              </div>
            )}

            {/* Right: Info */}
            <div className="product-info-panel">
              <div className="breadcrumbs">
                <Link href="/catalog">PRODUCTS</Link> / <span>{product.category}</span>
              </div>

              <h1 className="product-hero-title">{product.title}</h1>

              <p className="product-description">{product.description}</p>

              <div className="product-cta-group">
                <button className="btn-get-quote" onClick={handleGetQuote}>
                  GET QUOTE <i className="ri-arrow-right-line"></i>
                </button>
                <button className="btn-whatsapp" onClick={handleWhatsAppEnquiry}>
                  <i className="ri-whatsapp-line"></i> ENQUIRE ON WHATSAPP
                </button>
              </div>

              <div className="product-features">
                {product.features && product.features.map((feature, idx) => (
                  <div key={idx} className="feature-item">
                    <div className="feature-icon"><i className={feature.icon}></i></div>
                    <div className="feature-text">
                      <h4>{feature.title}</h4>
                      <p>{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Section: Specifications Table */}
          <div className="product-bottom-section">
            <div className="specs-header">
              <span className="orange-bar"></span>
              <h2>TECHNICAL SPECIFICATIONS</h2>
            </div>

            <div className="specs-table">
              {product.extendedSpecs && product.extendedSpecs.map((spec, idx) => (
                <div key={idx} className="spec-table-row">
                  <div className="spec-table-label">{spec.label}</div>
                  <div className="spec-table-value">{spec.value}</div>
                </div>
              ))}
            </div>

            {product.originalUrl && (
              <div className="view-original-container">
                <a
                  href={product.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-original-link"
                >
                  View on company page <i className="ri-external-link-line"></i>
                </a>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-left">
          <h2>MS Engineering</h2>
          <p>&copy; 2024 MS Engineering. All Rights Reserved. Safari & Boshco Authorized Partner.</p>
        </div>
        <div className="footer-right">
          <a href="#" onClick={handleComingSoon}>Privacy Policy</a>
          <a href="#" onClick={handleComingSoon}>Technical Specs</a>
          <a href="#" onClick={handleComingSoon}>Support</a>
          <a href="#" onClick={handleComingSoon}>Terms of Service</a>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button
        className={`btn-back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <i className="ri-arrow-up-line"></i>
      </button>

      {/* WhatsApp QR Modal */}
      {showQRModal && (
        <div className="qr-modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="qr-close-btn" onClick={() => setShowQRModal(false)}>
              <i className="ri-close-line"></i>
            </button>

            <div className="qr-header">
              <i className="ri-whatsapp-line whatsapp-icon-large"></i>
              <h3>Enquire on WhatsApp</h3>
              <p>Scan this QR code with your phone&apos;s camera to instantly open WhatsApp and send your inquiry.</p>
            </div>

            <div className="qr-code-box">
              <QRCode value={waLink} size={200} />
            </div>

            <div className="qr-footer">
              <p>Or open WhatsApp Web directly on this device:</p>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-wa-web">
                Open WhatsApp Web
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
