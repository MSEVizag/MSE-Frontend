"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import catalogDataRaw from '../../../public/data/catalog.json';
import ComingSoonModal from '../../components/ComingSoonModal';
import QuoteModal from '../../components/QuoteModal';
import { Product } from '../../types';
import './catalog.css';

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [activeTab, setActiveTab] = useState("All Products");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // If the query param changes (e.g. user goes back/forward), update state
  useEffect(() => {
    const s = searchParams.get('search');
    if (s !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchQuery(s);
    }
  }, [searchParams]);

  // Handle Search Logging
  const catalogData = catalogDataRaw as Product[];

  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new Event('open-coming-soon'));
  };

  const handleGetQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-quote-modal', { detail: null }));
  };

  // Debounced Search Logging
  useEffect(() => {
    if (searchQuery.trim() === '') return;

    const timer = setTimeout(() => {
      fetch('/api/log-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      }).catch(err => console.error("Search logging failed", err));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredData = catalogData.filter((product) => {
    // Tab filter
    const matchesTab = activeTab === "All Products" || product.category.toLowerCase() === activeTab.toLowerCase();
    
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = product.title.toLowerCase().includes(searchLower) || product.category.toLowerCase().includes(searchLower);

    return matchesTab && matchesSearch;
  });

  return (
    <>
      <ComingSoonModal />
      <QuoteModal />
      {/* --- Catalog Navbar --- */}
      <nav className="catalog-navbar">
        <div className="logo">
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>MS Engineering</h1>
          </Link>
        </div>
        
        {/* Desktop Links */}
        <div className="catalog-nav-links desktop-only">
          <Link href="/">Home</Link>
          <a href="#" onClick={handleComingSoon}>All</a>
          <a href="#" className="active-tab">Safari</a>
          <a href="#" onClick={handleComingSoon}>Boshco</a>
          <a href="#" onClick={handleComingSoon}>Compare</a>
        </div>
        <Link href="/contact" className="btn-contact-orange desktop-only">Contact Us</Link>
        
        {/* Mobile Menu Icon */}
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
            <a href="#" onClick={handleComingSoon}>All</a>
            <a href="#" className="active-tab">Safari</a>
            <a href="#" onClick={handleComingSoon}>Boshco</a>
            <a href="#" onClick={handleComingSoon}>Compare</a>
            <Link href="/contact" className="btn-contact-orange">Contact Us</Link>
          </div>
        </div>
      </>

      <main className="catalog-main">
        {/* Header Section */}
        <div className="catalog-header">
          <div className="catalog-header-text">
            <span className="catalog-tag">AUTHORIZED SAFARI PARTNER</span>
            <h1 className="catalog-title">Equipment Catalog</h1>
          </div>
          <div className="catalog-search-filters">
            <div className="search-bar" style={{ position: 'relative' }}>
              <i className="ri-search-line"></i>
              <input 
                type="text" 
                placeholder="Search equipment..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingRight: searchQuery ? '36px' : '16px' }}
              />
              {searchQuery && (
                <i 
                  className="ri-close-circle-fill" 
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#cbd5e1', fontSize: '18px' }}
                ></i>
              )}
            </div>
            <button className="btn-filters" onClick={() => setIsMobileFilterOpen(true)}>
              <i className="ri-filter-3-line"></i> Filters
            </button>
          </div>
        </div>

        {/* Category Tabs (Desktop) */}
        <div className="category-tabs desktop-tabs">
          {["All Products", "Mini Cranes", "Concrete Mixers", "Material Hoists", "Rebar Equipment", "Compaction"].map(tab => (
            <button 
              key={tab} 
              className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Mobile Filter Sidebar */}
        <>
          <div className={`mobile-sidebar-overlay ${isMobileFilterOpen ? 'open' : ''}`} onClick={() => setIsMobileFilterOpen(false)}></div>
          <div className={`mobile-sidebar filter-sidebar ${isMobileFilterOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h3>Filters</h3>
              <button className="sidebar-close" onClick={() => setIsMobileFilterOpen(false)}>
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="sidebar-filter-list">
              {["All Products", "Mini Cranes", "Concrete Mixers", "Material Hoists", "Rebar Equipment", "Compaction"].map(tab => (
                <button 
                  key={tab} 
                  className={`mobile-filter-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab);
                    setIsMobileFilterOpen(false);
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </>

        {/* Product Grid */}
        <div className="product-grid">
          {filteredData.map((product) => (
            <div key={product.id} className="product-card">
              {product.tag && <div className="product-badge">{product.tag}</div>}
              <div className="product-image-container">
                <img src={product.image} alt={product.title} className="product-image" />
              </div>
              <div className="product-info">
                <div className="product-category">{product.category}</div>
                <h3 className="product-title">{product.title}</h3>
                
                <div className="product-description" style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                  {product.description}
                </div>
                
                <Link href={`/catalog/${product.id}`} className="btn-view-details" style={{ textDecoration: 'none' }}>
                  View Details <i className="ri-arrow-right-line"></i>
                </Link>
              </div>
            </div>
          ))}
          {filteredData.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
              No equipment found matching your criteria.
            </div>
          )}
        </div>

        {/* CTA Banner */}
        <div className="cta-banner">
          <div className="cta-content">
            <h2 className="cta-title">Request a Technical<br/>Quote</h2>
            <p className="cta-desc">Need specific technical data or customized solutions for your large-scale project? Our engineering team provides detailed analysis and quotes within 24 hours.</p>
          </div>
          <div className="cta-buttons">
            <button className="btn-quote" onClick={handleGetQuote}>Request Specific Quote</button>
            <button className="btn-download-catalog" onClick={handleComingSoon}>Download Full Catalog</button>
          </div>
        </div>
      </main>

      {/* Standard Footer */}
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
    </>
  );
};

export default function Catalog() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading catalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
