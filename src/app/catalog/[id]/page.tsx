"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import ComingSoonModal from '../../../components/ComingSoonModal';
import QuoteModal from '../../../components/QuoteModal';
import { Product } from '../../../types';
import './product.css';

export default function ProductDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [productSearch, setProductSearch] = useState('');
  const [catalogData, setCatalogData] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const [faqs, setFaqs] = useState<{question: string, answer: string}[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/faq')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFaqs(data);
        }
      })
      .catch(err => console.error('Failed to fetch FAQs', err));
  }, []);

  useEffect(() => {
    fetch('/api/catalog')
      .then(res => res.json())
      .then(data => {
        if (data.catalog) {
          setCatalogData(data.catalog);
          setProduct(data.catalog.find((p: Product) => p.id === id) || null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch catalog', err);
        setLoading(false);
      });
  }, [id]);

  // WhatsApp Integration State
  const [showQRModal, setShowQRModal] = useState(false);
  const [waLink, setWaLink] = useState("");
  const BUSINESS_NUMBER = "917984627108"; // Placeholder business number

  const handleWhatsAppEnquiry = () => {
    if (!product) return;
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
  const thumbnails = product?.thumbnails || (product?.image ? [product.image] : []);
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

  if (loading) {
    return <div className="product-not-found">Loading product...</div>;
  }

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
        
        <ul className="nav-links desktop-only" style={{ flex: 1, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', alignItems: 'center', gap: '1rem' }}>
          <li>
            <Link href="/catalog" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', color: '#64748b', fontSize: '0.875rem', fontWeight: 500, padding: '8px 12px', borderRadius: '0.25rem', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <i className="ri-arrow-left-line"></i> Back
            </Link>
          </li>
        </ul>

        <div className="nav-search-container desktop-only" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <form onSubmit={(e) => { e.preventDefault(); if(productSearch.trim()) router.push(`/catalog?search=${encodeURIComponent(productSearch.trim())}`); }} style={{ width: '100%', maxWidth: '25rem', position: 'relative' }}>
            <i className="ri-search-line" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1rem' }}></i>
            <input 
              type="text" 
              placeholder="Search catalog..." 
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 36px 12px 42px', borderRadius: '1.5rem', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', backgroundColor: '#f8fafc', transition: 'all 0.2s' }}
              onFocus={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
              onBlur={(e) => { e.target.style.backgroundColor = '#f8fafc'; e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            />
            {productSearch && (
              <i 
                className="ri-close-circle-fill" 
                onClick={(e) => { e.preventDefault(); setProductSearch(''); }}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#cbd5e1', fontSize: '1.125rem' }}
              ></i>
            )}
          </form>
        </div>
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
                {thumbnails.length > 1 && (
                  <button className="gallery-nav-btn prev" onClick={handlePrev}>
                    <i className="ri-arrow-left-s-line"></i>
                  </button>
                )}

                <img src={activeImage} alt={product.title} />

                {showZoom && (
                  <div className="zoom-lens" style={{ left: `${lensPos.x}px`, top: `${lensPos.y}px` }}></div>
                )}

                {thumbnails.length > 1 && (
                  <button className="gallery-nav-btn next" onClick={handleNext}>
                    <i className="ri-arrow-right-s-line"></i>
                  </button>
                )}
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

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                {product.features && product.features.map((feature, idx) => (
                  <span key={idx} style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#d97706', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <i className={feature.icon}></i> {feature.title}
                  </span>
                ))}
              </div>

              <h1 className="product-hero-title">{product.title}</h1>

              {product.badges && product.badges.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {product.badges.map((badge, idx) => (
                    <span key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '4px 8px', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      <i className="ri-verified-badge-line" style={{ color: '#3b82f6', marginRight: '0.25rem' }}></i>
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                {product.stockStatus && (
                  <span style={{ color: product.stockStatus.toLowerCase().includes('stock') ? '#10b981' : '#f59e0b', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <i className="ri-box-3-line"></i> {product.stockStatus}
                  </span>
                )}
                {product.moq && (
                  <span style={{ color: '#64748b', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <i className="ri-shopping-cart-2-line"></i> MOQ: {product.moq} Units
                  </span>
                )}
              </div>

              {product.pricingTiers && product.pricingTiers.length > 0 && !product.hideExactPrices && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.875rem', color: '#334155' }}>Bulk Pricing</h4>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {product.pricingTiers.map((tier, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: idx !== product.pricingTiers!.length - 1 ? '1px dashed #cbd5e1' : 'none', paddingBottom: idx !== product.pricingTiers!.length - 1 ? '0.5rem' : '0' }}>
                        <span style={{ color: '#475569', fontSize: '0.875rem' }}>{tier.minQty}{tier.maxQty > tier.minQty ? ` - ${tier.maxQty}` : '+'} Units</span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>${tier.price.toLocaleString()} / unit</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              <div className="product-cta-group" style={{ display: 'flex', marginBottom: '1.5rem', paddingBottom: 0, borderBottom: 'none' }}>
                <button className="btn-get-quote" onClick={handleGetQuote} style={{ width: '100%' }}>
                  GET ESTIMATE <i className="ri-arrow-right-line"></i>
                </button>
              </div>

              {/* Compact WhatsApp Banner Section */}
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '2.5rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <i className="ri-whatsapp-fill" style={{ fontSize: '1.5rem', color: '#16a34a' }}></i>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                    Enquire via WhatsApp
                  </div>
                </div>

                <div className="desktop-only" style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem', display: 'inline-block', marginBottom: '1rem', backgroundColor: '#f8fafc' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`https://wa.me/?text=Hi, I'm interested in the ${product.title}. Please provide more details.\n\nProduct URL: https://msevizag.com/catalog/${product.id}`)}`} alt="WhatsApp QR Code" style={{ width: '120px', height: '120px', marginBottom: '0.5rem' }} />
                  <div style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600 }}>Scan & Reach out</div>
                </div>

                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(`Hi, I'm interested in the ${product.title}. Please provide more details.\n\nProduct URL: ${typeof window !== 'undefined' ? window.location.href : 'https://msevizag.com/catalog/' + product.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', fontSize: '0.875rem', backgroundColor: '#25D366', color: '#fff', padding: '0.75rem 1rem', borderRadius: '9999px', textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s', boxSizing: 'border-box', marginBottom: '1.5rem' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#16a34a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#25D366'; }}
                >
                  Send Message
                </a>

                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '1rem' }}>
                    <i className="ri-flashlight-line" style={{ color: '#10b981', fontSize: '1.25rem' }}></i> Instant replies
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '1rem' }}>
                    <i className="ri-customer-service-2-line" style={{ color: '#10b981', fontSize: '1.25rem' }}></i> Direct contact with experts
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '1rem' }}>
                    <i className="ri-image-2-line" style={{ color: '#10b981', fontSize: '1.25rem' }}></i> Easy media sharing
                  </div>
                </div>
              </div>


            </div>

          </div>

          {/* Bottom Section: Specifications Table */}
          <div className="product-bottom-section">
            
            {product.description && (
              <div style={{ marginBottom: '2.5rem' }}>
                <div className="specs-header">
                  <span className="orange-bar"></span>
                  <h2>PRODUCT DESCRIPTION</h2>
                </div>
                <div className="product-description-full" dangerouslySetInnerHTML={{ __html: product.description }}></div>
              </div>
            )}


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

            {faqs && faqs.length > 0 && (
              <div style={{ marginTop: '2.5rem', backgroundColor: '#ffedd5', padding: '3rem 2rem', borderRadius: '1rem', color: '#2c1e16' }}>
                <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '2.5rem', color: '#2c1e16', fontWeight: 700 }}>Have questions?</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {faqs.map((faq, idx) => (
                    <div key={idx} style={{ borderBottom: '1px solid #fff' }}>
                      <button 
                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600, color: '#2c1e16', fontSize: '1rem' }}
                      >
                        <span>{faq.question}</span>
                        <i className={openFaqIndex === idx ? "ri-eye-line" : "ri-eye-close-line"} style={{ color: '#2c1e16', fontSize: '1.25rem' }}></i>
                      </button>
                      
                      <div style={{ display: 'grid', gridTemplateRows: openFaqIndex === idx ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease-in-out' }}>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ padding: '0 0 1.5rem 0', color: '#333', fontSize: '0.875rem', lineHeight: 1.6 }}>
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#333', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
                    Have a question we haven't answered here? Our team is more than happy to answer any questions you may have regarding our products.
                  </p>
                  <Link href="/contact" style={{ display: 'inline-block', padding: '0.75rem 2rem', border: '1px solid #2c1e16', borderRadius: '9999px', textDecoration: 'none', color: '#2c1e16', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                    Get in Touch
                  </Link>
                </div>
              </div>
            )}

            {product.videoUrl && (
              <div style={{ marginTop: '2.5rem' }}>
                <div className="specs-header">
                  <span className="orange-bar"></span>
                  <h2>PRODUCT VIDEO</h2>
                </div>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                  <iframe src={product.videoUrl.replace('watch?v=', 'embed/')} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} allowFullScreen></iframe>
                </div>
              </div>
            )}

            {product.testimonials && product.testimonials.length > 0 && product.testimonials[0].reviewText && (
              <div style={{ marginTop: '2.5rem' }}>
                <div className="specs-header">
                  <span className="orange-bar"></span>
                  <h2>CLIENT REVIEWS</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {product.testimonials.map((test, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', color: '#f59e0b', marginBottom: '0.75rem' }}>
                        {Array.from({ length: test.rating }).map((_, i) => <i key={i} className="ri-star-fill"></i>)}
                      </div>
                      <p style={{ fontStyle: 'italic', color: '#475569', marginBottom: '1rem', lineHeight: 1.6 }}>"{test.reviewText}"</p>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{test.clientName}</div>
                      {test.isVerified && <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}><i className="ri-checkbox-circle-fill"></i> Verified Buyer</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
