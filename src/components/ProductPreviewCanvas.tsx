"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';

interface ProductPreviewCanvasProps {
  product: Product;
  activePreviewTab?: string;
}

export default function ProductPreviewCanvas({ product, activePreviewTab }: ProductPreviewCanvasProps) {
  const [activeTab, setActiveTab] = useState('specs');

  useEffect(() => {
    if (activePreviewTab) {
      setActiveTab(activePreviewTab);
    }
  }, [activePreviewTab]);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLInputElement>(null);

  // Keyboard bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input inside the modal
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          setIsQuoteModalOpen(false);
          setIsImageFullscreen(false);
        }
        return;
      }

      switch(e.key.toLowerCase()) {
        case 'q':
          e.preventDefault();
          setIsQuoteModalOpen(true);
          break;
        case 'i':
          e.preventDefault();
          handleInquire();
          break;
        case 'escape':
          setIsQuoteModalOpen(false);
          setIsImageFullscreen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product]);

  // Trap focus inside modal
  useEffect(() => {
    if (isQuoteModalOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isQuoteModalOpen]);

  const handleInquire = () => {
    const phone = "+15550000000";
    const text = encodeURIComponent(`Hi, I am inquiring about Product ID: #SKU-TEMP - ${product.title}`);
    window.open(`https://wa.me/${phone.replace(/[^0-9+]/g, '')}?text=${text}`, '_blank');
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get('v');
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  return (
    <div className="preview-canvas">
      {/* Product Header Row */}
      <div className="preview-header" id="preview-section-title">
        <div className="preview-meta">
          <span className="preview-category">{product.category || 'Category'}</span>
          <span className="preview-sku">#SKU-9042</span>
        </div>
        <h1 className="preview-title">{product.title || 'Product Title'}</h1>
        
        {/* Compliance Badges */}
        {product.badges && product.badges.length > 0 && (
          <div className="preview-badges-scroll">
            {product.badges.map(b => (
              <span key={b} className="preview-badge" title={b}>
                <i className="ri-shield-check-line"></i> {b}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="preview-hero">
        {/* Gallery */}
        <div className="preview-gallery" id="preview-section-images">
          <div className="preview-thumbnails">
            {(product.thumbnails && product.thumbnails.length > 0 ? product.thumbnails : [product.image]).map((thumb, idx) => (
              <button 
                key={idx} 
                className={`preview-thumb ${idx === activeImageIndex ? 'active' : ''}`} 
                aria-label={`View image ${idx + 1}`}
                onClick={() => setActiveImageIndex(idx)}
              >
                <img src={thumb || 'https://via.placeholder.com/60'} alt={`Thumb ${idx + 1}`} />
              </button>
            ))}
          </div>
          <div className="preview-main-image-wrapper">
            <button 
              className="preview-main-image-btn" 
              onClick={() => setIsImageFullscreen(true)}
              aria-label="Enlarge image"
              title="Click to zoom (or press Enter when focused)"
            >
              <img 
                src={
                  (product.thumbnails && product.thumbnails.length > 0 
                    ? product.thumbnails[activeImageIndex] 
                    : product.image) || 'https://via.placeholder.com/600x400?text=No+Image'
                } 
                alt={product.title} 
              />
              <div className="zoom-indicator"><i className="ri-zoom-in-line"></i></div>
            </button>
          </div>
        </div>

        {/* Action Panel */}
        <div className="preview-action-panel" id="preview-section-pricing">
          <div className="preview-pricing">
            <h3>Inventory & Pricing</h3>
            <div className="preview-inventory-meta">
              <div><span className="meta-label">MOQ:</span> <strong>{product.moq || 1} units</strong></div>
              <div><span className="meta-label">Lead Time:</span> <span className="status-dot"></span> {product.stockStatus || 'In Stock'}</div>
            </div>
            
            {product.hideExactPrices ? (
              <div className="price-hidden-badge">
                <i className="ri-file-list-3-line"></i> Request Tiered Quote
              </div>
            ) : (
              <div className="preview-tiers-table-container">
                <table className="preview-tiers-table">
                  <thead>
                    <tr>
                      <th>Quantity Tier</th>
                      <th>Unit Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(product.pricingTiers && product.pricingTiers.length > 0) ? product.pricingTiers.map((t, i) => (
                      <tr key={i}>
                        <td>{t.minQty} - {t.maxQty > 0 ? t.maxQty : '+'} Units</td>
                        <td>${t.price}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={2}>No tiers defined</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="preview-ctas">
            <button className="preview-btn-secondary" onClick={handleInquire} title="Shortcut: Press 'I'">
              <i className="ri-whatsapp-line" style={{ fontSize: '18px', color: '#25D366' }}></i> Inquire Now
            </button>
            <button className="preview-btn-primary" onClick={() => setIsQuoteModalOpen(true)} title="Shortcut: Press 'Q'">
              Get Quote
            </button>
          </div>
        </div>
      </div>

      {/* Product Description */}
      {product.description && (
        <div className="preview-description-section" id="preview-section-description" style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Product Overview</h3>
          <p className="preview-description" style={{ marginTop: 0, whiteSpace: 'pre-wrap' }}>
            {product.description}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="preview-tabs-section" id="preview-section-specs">
        <div className="preview-tab-headers" role="tablist">
          <button role="tab" aria-selected={activeTab === 'specs'} className={`preview-tab-btn ${activeTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveTab('specs')}>
            Technical Specs
          </button>
          <button role="tab" aria-selected={activeTab === 'video'} className={`preview-tab-btn ${activeTab === 'video' ? 'active' : ''}`} onClick={() => setActiveTab('video')}>
            Product Video
          </button>
          <button role="tab" aria-selected={activeTab === 'reviews'} className={`preview-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
            Project References
          </button>
        </div>
        
        <div className="preview-tab-content">
          {activeTab === 'specs' && (
            <div className="preview-specs-grid">
              {(product.specs && product.specs.length > 0) ? product.specs.map((s, i) => (
                <div key={i} className="spec-row">
                  <span className="spec-label">{s.label || '-'}</span>
                  <span className="spec-value">{s.value || '-'}</span>
                </div>
              )) : <p>No specifications defined.</p>}
            </div>
          )}

          {activeTab === 'video' && (
            <div className="preview-video-container" style={{ padding: '24px 0', textAlign: 'center' }}>
              {product.videoUrl ? (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', background: '#000' }}>
                  <iframe 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    src={getEmbedUrl(product.videoUrl)} 
                    title="Product Video" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div style={{ padding: '40px', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                  <i className="ri-video-line" style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }}></i>
                  <p>No video available for this product.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="preview-reviews-list">
              {(product.testimonials && product.testimonials.length > 0) ? product.testimonials.map((t, i) => (
                <div key={i} className="review-card">
                  <div className="review-header">
                    <h4>{t.clientName || 'Anonymous'}</h4>
                    {t.isVerified && <span className="verified-badge"><i className="ri-checkbox-circle-fill"></i> Verified Buyer</span>}
                  </div>
                  <div className="review-rating">
                    {[...Array(5)].map((_, j) => (
                      <i key={j} className={j < (t.rating || 5) ? "ri-star-fill" : "ri-star-line"}></i>
                    ))}
                  </div>
                  <p>"{t.reviewText || 'No review text provided.'}"</p>
                </div>
              )) : <p>No testimonials available.</p>}
            </div>
          )}
        </div>
      </div>

      {/* Quote Modal */}
      {isQuoteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsQuoteModalOpen(false)}>
          <div 
            className="quote-modal" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="modal-title"
            onClick={e => e.stopPropagation()}
            ref={modalRef}
          >
            <div className="modal-header">
              <h2 id="modal-title">Request a Bulk Quote for {product.title || 'Product'}</h2>
              <span className="modal-sku">#SKU-9042</span>
              <button className="modal-close" onClick={() => setIsQuoteModalOpen(false)} aria-label="Close modal">
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-form-group">
                <label htmlFor="quote-qty">Required Quantity</label>
                <input ref={firstFocusableRef} id="quote-qty" type="number" min="1" placeholder="e.g. 50" />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="modal-form-group" style={{ flex: 1 }}>
                  <label htmlFor="quote-phone">Mobile Phone</label>
                  <input id="quote-phone" type="tel" placeholder="+1 (555) 000-0000" />
                </div>
                <div className="modal-form-group" style={{ flex: 1 }}>
                  <label htmlFor="quote-email">Work Email</label>
                  <input id="quote-email" type="email" placeholder="name@company.com" />
                </div>
              </div>
              <div className="modal-form-group">
                <label htmlFor="quote-scope">Project Scope / Delivery Location</label>
                <textarea id="quote-scope" rows={3} placeholder="Describe your project needs..."></textarea>
              </div>
              <button className="modal-submit-btn">Submit Request</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Fullscreen Overlay */}
      {isImageFullscreen && (
        <div className="fullscreen-overlay" onClick={() => setIsImageFullscreen(false)}>
          <button className="modal-close fullscreen-close" aria-label="Close fullscreen">
            <i className="ri-close-line"></i>
          </button>
          <img 
            src={
              (product.thumbnails && product.thumbnails.length > 0 
                ? product.thumbnails[activeImageIndex] 
                : product.image) || 'https://via.placeholder.com/600x400?text=No+Image'
            } 
            alt={product.title} 
            className="fullscreen-img" 
            onClick={e => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}
