"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Product } from '../types';
import ProductPreviewCanvas from './ProductPreviewCanvas';
import '../app/catalog/catalog.css';

interface AdminDashboardProps {
  initialCatalog: Product[];
  initialQuotes: any[];
  initialSearchLogs: any[];
}

export default function AdminDashboard({ initialCatalog, initialQuotes, initialSearchLogs }: AdminDashboardProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const activeTab = pathname.includes('/admin/add-item') ? 'add' 
                  : pathname.includes('/admin/quotes') ? 'quotes'
                  : pathname.includes('/admin/analytics') ? 'analytics'
                  : 'catalog';

  const [catalog, setCatalog] = useState(initialCatalog);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    title: '',
    category: 'MINI CRANES',
    description: '',
    image: '',
    thumbnails: [] as string[],
    specs: [{ label: '', value: '' }],
    tag: '',
    videoUrl: '',
    badges: [] as string[],
    moq: 1 as number | string,
    stockStatus: 'In Stock - Ships in 48hrs',
    pricingTiers: [{ minQty: 1, maxQty: 10, price: 0 }],
    hideExactPrices: false,
    testimonials: [{ clientName: '', reviewText: '', rating: 5, isVerified: false }],
    documents: [{ label: '', url: '' }],
    contactConfig: { phone: '', enableRfqModal: true }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('specs');

  // Auto-save draft
  useEffect(() => {
    const savedDraft = localStorage.getItem('admin_product_draft');
    if (savedDraft) {
      try {
        setNewProduct(JSON.parse(savedDraft));
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
    setIsDraftLoaded(true);
  }, []);

  useEffect(() => {
    if (isDraftLoaded) {
      localStorage.setItem('admin_product_draft', JSON.stringify(newProduct));
    }
  }, [newProduct, isDraftLoaded]);
  const scrollToPreview = (sectionId: string) => {
    const container = document.querySelector('.admin-preview-column');
    const target = document.getElementById(sectionId);
    if (container && target) {
      const containerTop = container.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      const offset = targetTop - containerTop;
      container.scrollTo({
        top: container.scrollTop + offset - 24,
        behavior: 'smooth'
      });
    }
  };

  const handleFormFocus = (e: React.FocusEvent) => {
    setIsSidebarCollapsed(true);
    const target = e.target as HTMLElement;
    const idMap: Record<string, string> = {
      title: 'preview-section-title',
      category: 'preview-section-title',
      tag: 'preview-section-title',
      image: 'preview-section-images',
      description: 'preview-section-description',
    };
    
    let sectionId = idMap[target.id];
    
    if (!sectionId) {
      const fieldset = target.closest('details');
      if (fieldset) {
        const summary = fieldset.querySelector('summary')?.textContent || '';
        const formGroup = target.closest('.admin-form-group');
        const labelText = formGroup?.querySelector('label')?.textContent || '';
        
        if (summary.includes('Specs') || summary.includes('Video')) {
          sectionId = 'preview-section-specs';
          if (labelText.includes('Video')) {
            setActivePreviewTab('video');
          } else {
            setActivePreviewTab('specs');
          }
        }
        if (summary.includes('Testimonials') || summary.includes('Projects')) {
          sectionId = 'preview-section-specs';
          setActivePreviewTab('reviews');
        }
        if (summary.includes('Inventory') || summary.includes('Bulk')) {
          sectionId = 'preview-section-pricing';
        }
      }
    }

    if (sectionId) {
      scrollToPreview(sectionId);
    }
  };

  // Search Analytics Logic
  const topSearches = useMemo(() => {
    const counts: Record<string, number> = {};
    initialSearchLogs.forEach(log => {
      const q = log.query.toLowerCase().trim();
      counts[q] = (counts[q] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count);
  }, [initialSearchLogs]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...newProduct,
        moq: Number(newProduct.moq) || 1,
        image: newProduct.thumbnails?.[0] || newProduct.image,
        specs: newProduct.specs.filter(s => s.label && s.value), // Remove empty specs
        features: [{ title: "NEW PRODUCT", desc: "Added from Admin Panel", icon: "ri-star-line" }], // Default placeholder
        thumbnails: newProduct.thumbnails?.length > 0 ? newProduct.thumbnails : [newProduct.image],
        extendedSpecs: newProduct.specs.filter(s => s.label && s.value)
      };

      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setCatalog([...catalog, data.product]);
        setNewProduct({ 
          title: '', category: 'MINI CRANES', description: '', image: '', thumbnails: [] as string[], specs: [{ label: '', value: '' }], tag: '', videoUrl: '',
          documents: [{ label: '', url: '' }], badges: [] as string[], moq: 1 as number | string, stockStatus: 'In Stock - Ships in 48hrs', 
          pricingTiers: [{ minQty: 1, maxQty: 10, price: 0 }], hideExactPrices: false, 
          testimonials: [{ clientName: '', reviewText: '', rating: 5, isVerified: false }], 
          contactConfig: { phone: '', enableRfqModal: true } 
        });
        localStorage.removeItem('admin_product_draft');
        alert('Product Added Successfully!');
        router.push('/admin');
      } else {
        alert('Error adding product: ' + data.error);
      }
    } catch (err) {
      alert('Error adding product');
    }
    setIsSubmitting(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch('/api/catalog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      const data = await res.json();
      if (data.success) {
        setCatalog(catalog.filter((p: any) => p.id !== id));
      } else {
        alert('Error deleting product: ' + data.error);
      }
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const filteredCatalog = catalog.filter((p: any) => 
    p.title.toLowerCase().includes(catalogSearch.toLowerCase()) || 
    p.category.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 24px', borderBottom: '1px solid #334155', marginBottom: '24px' }}>
          {!isSidebarCollapsed && <h2 style={{ padding: 0, border: 'none', margin: 0 }}>MS Admin</h2>}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '20px', padding: 0, margin: isSidebarCollapsed ? '0 auto' : 0 }}
          >
            <i className={isSidebarCollapsed ? 'ri-menu-unfold-line' : 'ri-menu-fold-line'}></i>
          </button>
        </div>
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'catalog' ? 'active' : ''}`} onClick={() => router.push('/admin')} title="Catalog Overview">
            <i className="ri-list-check"></i> {!isSidebarCollapsed && "Catalog Overview"}
          </button>
          <button className={`admin-nav-item ${activeTab === 'add' ? 'active' : ''}`} onClick={() => router.push('/admin/add-item')} title="Add Product">
            <i className="ri-add-box-line"></i> {!isSidebarCollapsed && "Add Product"}
          </button>
          <button className={`admin-nav-item ${activeTab === 'quotes' ? 'active' : ''}`} onClick={() => router.push('/admin/quotes')} title="Quote Requests">
            <i className="ri-message-3-line"></i> {!isSidebarCollapsed && "Quote Requests"}
            {!isSidebarCollapsed && initialQuotes.length > 0 && <span className="admin-badge">{initialQuotes.length}</span>}
          </button>
          <button className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => router.push('/admin/analytics')} title="Search Analytics">
            <i className="ri-bar-chart-box-line"></i> {!isSidebarCollapsed && "Search Analytics"}
          </button>
          <div style={{ flex: 1 }}></div>
          <Link href="/" className="admin-nav-item" style={{ marginTop: 'auto' }} title="Back to Website">
            <i className="ri-home-4-line"></i> {!isSidebarCollapsed && "Back to Website"}
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        {activeTab === 'catalog' && (
          <div>
            <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1>Catalog Overview</h1>
                <p>Manage your {catalog.length} active products.</p>
              </div>
              <div>
                <div style={{ position: 'relative' }}>
                  <i className="ri-search-line" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                  <input 
                    type="text" 
                    placeholder="Search catalog..." 
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    style={{ padding: '10px 12px 10px 36px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '250px', fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>
            <div className="admin-card admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCatalog.map((p: any) => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td><img src={p.image} alt={p.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                      <td style={{ fontWeight: 600 }}>{p.title}</td>
                      <td><span className="admin-badge">{p.category}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link 
                            href={`/catalog/${p.id}`}
                            target="_blank"
                            style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '18px', padding: '4px', display: 'flex', alignItems: 'center' }}
                            title="View Product on Website"
                          >
                            <i className="ri-eye-line"></i>
                          </Link>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
                            title="Delete Product"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCatalog.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div>
            <div className="admin-header">
              <h1>Add New Product</h1>
              <p>Publish new equipment directly to your catalog.</p>
            </div>
            
            <div className="admin-split-layout">
              {/* Form Column */}
              <div className="admin-form-column">
                <form onSubmit={handleAddProduct} onFocusCapture={handleFormFocus}>
                  <details className="admin-fieldset" open>
                    <summary><i className="ri-information-line"></i> Basic Information <i className="ri-arrow-down-s-line" style={{ marginLeft: 'auto' }}></i></summary>
                    <div className="admin-form-group">
                      <label htmlFor="title">Product Title</label>
                      <input id="title" type="text" required value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} placeholder="e.g. SAFARI SFPM 2000" />
                    </div>
                    <div className="admin-form-group">
                      <label htmlFor="category">Category</label>
                      <select id="category" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                        <option value="MINI CRANES">Mini Cranes</option>
                        <option value="CONCRETE MIXERS">Concrete Mixers</option>
                        <option value="MATERIAL HOISTS">Material Hoists</option>
                        <option value="REBAR EQUIPMENT">Rebar Equipment</option>
                        <option value="COMPACTION">Compaction</option>
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label htmlFor="image">Product Images (Up to 12)</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input 
                          id="image"
                          type="file" 
                          multiple
                          accept="image/*" 
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []).slice(0, 12);
                            if (files.length > 0) {
                              const base64Images = await Promise.all(
                                files.map((file) => {
                                  return new Promise<string>((resolve) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve(reader.result as string);
                                    reader.readAsDataURL(file);
                                  });
                                })
                              );
                              const combinedImages = [...(newProduct.thumbnails || []), ...base64Images].slice(0, 12);
                              setNewProduct({...newProduct, thumbnails: combinedImages, image: combinedImages[0]});
                            }
                          }}
                          style={{ padding: '10px', border: '1px dashed #cbd5e1', borderRadius: '6px', background: '#f8fafc', cursor: 'pointer', fontSize: '13px' }}
                        />
                        {newProduct.thumbnails && newProduct.thumbnails.length > 0 && (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {newProduct.thumbnails.map((img, i) => (
                              <div key={i} className="admin-image-preview-wrapper" style={{ position: 'relative' }}>
                                <img src={img} alt={`Preview ${i}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                                <button 
                                  type="button"
                                  className="admin-image-delete-btn"
                                  title="Remove image"
                                  onClick={() => {
                                    const newThumbnails = newProduct.thumbnails.filter((_, idx) => idx !== i);
                                    setNewProduct({ ...newProduct, thumbnails: newThumbnails, image: newThumbnails[0] || '' });
                                  }}
                                >
                                  <i className="ri-close-line"></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="admin-form-group">
                      <label htmlFor="description">Description</label>
                      <textarea id="description" required rows={4} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Brief product overview..."></textarea>
                    </div>
                    <div className="admin-form-group">
                      <label htmlFor="tag">Product Tag (Optional)</label>
                      <input id="tag" type="text" value={newProduct.tag} onChange={e => setNewProduct({...newProduct, tag: e.target.value})} placeholder="e.g. AUTHORIZED SAFARI PARTNER" />
                    </div>
                  </details>

                  <details className="admin-fieldset">
                    <summary><i className="ri-list-settings-line"></i> Technical Specs & Video <i className="ri-arrow-down-s-line" style={{ marginLeft: 'auto' }}></i></summary>
                    <div className="admin-form-group">
                      <label>Product Specifications</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {newProduct.specs.map((spec, index) => (
                          <div key={index} style={{ display: 'flex', gap: '8px' }}>
                            <input type="text" value={spec.label} onChange={(e) => {
                              const newSpecs = [...newProduct.specs];
                              newSpecs[index].label = e.target.value;
                              setNewProduct({...newProduct, specs: newSpecs});
                            }} placeholder="Label (e.g. Capacity)" style={{ flex: 1 }} />
                            <input type="text" value={spec.value} onChange={(e) => {
                              const newSpecs = [...newProduct.specs];
                              newSpecs[index].value = e.target.value;
                              setNewProduct({...newProduct, specs: newSpecs});
                            }} placeholder="Value (e.g. 2000L)" style={{ flex: 1 }} />
                            <button type="button" onClick={() => {
                              if (newProduct.specs.length > 1) {
                                const newSpecs = newProduct.specs.filter((_, i) => i !== index);
                                setNewProduct({...newProduct, specs: newSpecs});
                              }
                            }} style={{ padding: '8px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => setNewProduct({...newProduct, specs: [...newProduct.specs, { label: '', value: '' }]})} style={{ alignSelf: 'flex-start', padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', color: '#475569' }}>
                          + Add Specification
                        </button>
                      </div>
                    </div>
                    
                    <div className="admin-form-group">
                      <label htmlFor="videoUrl">Product Video URL (Optional)</label>
                      <input 
                        id="videoUrl" 
                        type="url" 
                        value={newProduct.videoUrl || ''} 
                        onChange={e => setNewProduct({...newProduct, videoUrl: e.target.value})} 
                        placeholder="e.g. https://youtube.com/watch?v=..." 
                      />
                    </div>
                  </details>

                  <details className="admin-fieldset">
                    <summary><i className="ri-verified-badge-line"></i> Certifications & Compliance <i className="ri-arrow-down-s-line" style={{ marginLeft: 'auto' }}></i></summary>
                    <div className="admin-form-group">
                      <label>Compliance Badges</label>
                      <div className="admin-badge-select">
                        {["ISO 9001", "CE Certified", "Fire-Rated 2HR", "Green Building Standard", "Heavy-Duty Structural", "OEM Parts"].map(badge => (
                          <button 
                            key={badge} 
                            type="button"
                            className={`badge-option ${newProduct.badges.includes(badge) ? 'selected' : ''}`}
                            onClick={() => {
                              const newBadges = newProduct.badges.includes(badge)
                                ? newProduct.badges.filter(b => b !== badge)
                                : [...newProduct.badges, badge];
                              setNewProduct({...newProduct, badges: newBadges});
                            }}
                          >
                            {badge}
                          </button>
                        ))}
                      </div>
                    </div>
                  </details>

                  <details className="admin-fieldset">
                    <summary><i className="ri-money-dollar-box-line"></i> Inventory & Bulk Pricing <i className="ri-arrow-down-s-line" style={{ marginLeft: 'auto' }}></i></summary>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div className="admin-form-group" style={{ flex: 1 }}>
                        <label htmlFor="moq">Minimum Order Qty (MOQ)</label>
                        <input id="moq" type="number" min="1" value={newProduct.moq} onChange={e => setNewProduct({...newProduct, moq: e.target.value === '' ? '' : parseInt(e.target.value) || ''})} />
                      </div>
                      <div className="admin-form-group" style={{ flex: 1 }}>
                        <label htmlFor="stockStatus">Stock Status</label>
                        <select id="stockStatus" value={newProduct.stockStatus} onChange={e => setNewProduct({...newProduct, stockStatus: e.target.value})}>
                          <option value="In Stock - Ships in 48hrs">In Stock - Ships in 48hrs</option>
                          <option value="Made to Order - 2 Weeks">Made to Order - 2 Weeks</option>
                          <option value="Freight Only">Freight Only</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="admin-form-group">
                      <label>Tiered Pricing</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {newProduct.pricingTiers.map((tier, index) => (
                          <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input type="number" value={tier.minQty} onChange={(e) => {
                              const newTiers = [...newProduct.pricingTiers];
                              newTiers[index].minQty = parseInt(e.target.value) || 0;
                              setNewProduct({...newProduct, pricingTiers: newTiers});
                            }} placeholder="Min Qty" style={{ width: '80px' }} />
                            <span>to</span>
                            <input type="number" value={tier.maxQty} onChange={(e) => {
                              const newTiers = [...newProduct.pricingTiers];
                              newTiers[index].maxQty = parseInt(e.target.value) || 0;
                              setNewProduct({...newProduct, pricingTiers: newTiers});
                            }} placeholder="Max Qty" style={{ width: '80px' }} />
                            <span>→ $</span>
                            <input type="number" value={tier.price} onChange={(e) => {
                              const newTiers = [...newProduct.pricingTiers];
                              newTiers[index].price = parseInt(e.target.value) || 0;
                              setNewProduct({...newProduct, pricingTiers: newTiers});
                            }} placeholder="Price" style={{ flex: 1 }} />
                            <button type="button" onClick={() => {
                              const newTiers = newProduct.pricingTiers.filter((_, i) => i !== index);
                              setNewProduct({...newProduct, pricingTiers: newTiers});
                            }} style={{ padding: '8px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => setNewProduct({...newProduct, pricingTiers: [...newProduct.pricingTiers, { minQty: 0, maxQty: 0, price: 0 }]})} style={{ alignSelf: 'flex-start', padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', color: '#475569' }}>
                          + Add Pricing Tier
                        </button>
                      </div>
                    </div>

                    <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={newProduct.hideExactPrices} onChange={e => setNewProduct({...newProduct, hideExactPrices: e.target.checked})} />
                        <span className="toggle-slider"></span>
                      </label>
                      <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>Hide exact prices on public page (Show "Request Tiered Quote")</span>
                    </div>
                  </details>

                  <details className="admin-fieldset">
                    <summary><i className="ri-message-2-line"></i> Client Testimonials & Projects <i className="ri-arrow-down-s-line" style={{ marginLeft: 'auto' }}></i></summary>
                    <div className="admin-form-group">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {newProduct.testimonials.map((test, index) => (
                          <div key={index} style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <input type="text" value={test.clientName} onChange={(e) => {
                                const newTests = [...newProduct.testimonials];
                                newTests[index].clientName = e.target.value;
                                setNewProduct({...newProduct, testimonials: newTests});
                              }} placeholder="Client Name / Enterprise Title" style={{ flex: 1 }} />
                              <input type="number" min="1" max="5" value={test.rating} onChange={(e) => {
                                const newTests = [...newProduct.testimonials];
                                newTests[index].rating = parseInt(e.target.value) || 5;
                                setNewProduct({...newProduct, testimonials: newTests});
                              }} placeholder="Rating (1-5)" style={{ width: '100px' }} />
                            </div>
                            <textarea rows={2} value={test.reviewText} onChange={(e) => {
                              const newTests = [...newProduct.testimonials];
                              newTests[index].reviewText = e.target.value;
                              setNewProduct({...newProduct, testimonials: newTests});
                            }} placeholder="Quote / Review Text"></textarea>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input type="checkbox" id={`verified-${index}`} checked={test.isVerified} style={{ width: 'auto' }} onChange={(e) => {
                                  const newTests = [...newProduct.testimonials];
                                  newTests[index].isVerified = e.target.checked;
                                  setNewProduct({...newProduct, testimonials: newTests});
                                }} />
                                <label htmlFor={`verified-${index}`} style={{ margin: 0, fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', display: 'inline' }}>Verified Site Buyer</label>
                              </div>
                              <button type="button" onClick={() => {
                                const newTests = newProduct.testimonials.filter((_, i) => i !== index);
                                setNewProduct({...newProduct, testimonials: newTests});
                              }} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Remove</button>
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={() => setNewProduct({...newProduct, testimonials: [...newProduct.testimonials, { clientName: '', reviewText: '', rating: 5, isVerified: false }]})} style={{ alignSelf: 'flex-start', padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', color: '#475569' }}>
                          + Add Testimonial
                        </button>
                      </div>
                    </div>
                  </details>


                  <button type="submit" className="admin-btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '16px' }}>
                    {isSubmitting ? 'Publishing...' : 'Publish Enterprise Product'}
                  </button>
                </form>
              </div>

              {/* Preview Canvas Column */}
              <div className="admin-preview-column">
                <ProductPreviewCanvas product={newProduct as any} activePreviewTab={activePreviewTab} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quotes' && (
          <div>
            <div className="admin-header">
              <h1>Quote Requests</h1>
              <p>View all customer inquiries submitted through the website.</p>
            </div>
            <div className="admin-card admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Product Context</th>
                    <th>Qty</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {[...initialQuotes].reverse().map((q: any) => (
                    <tr key={q.id}>
                      <td>{new Date(q.timestamp).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 600 }}>{q.name}</td>
                      <td>
                        <div style={{ fontSize: '13px' }}>{q.email}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>{q.phone}</div>
                      </td>
                      <td><span className="admin-badge">{q.context}</span></td>
                      <td>{q.quantity || '-'}</td>
                      <td style={{ fontSize: '12px', color: '#94a3b8' }}>#{q.id}</td>
                    </tr>
                  ))}
                  {initialQuotes.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No quote requests yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <div className="admin-header">
              <h1>Search Analytics</h1>
              <p>Discover exactly what your customers are looking for.</p>
            </div>

            <div className="analytics-grid" style={{ marginBottom: '32px' }}>
              <div className="analytics-card">
                <span className="analytics-card-title">Total Searches</span>
                <span className="analytics-card-value">{initialSearchLogs.length}</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-card-title">Unique Terms</span>
                <span className="analytics-card-value">{topSearches.length}</span>
              </div>
            </div>

            <div className="admin-card admin-table-container" style={{ maxWidth: '600px' }}>
              <h3>Top Searched Words</h3>
              <table className="admin-table" style={{ marginTop: '16px' }}>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Search Query</th>
                    <th>Searches</th>
                  </tr>
                </thead>
                <tbody>
                  {topSearches.map((item, index) => (
                    <tr key={index}>
                      <td>#{index + 1}</td>
                      <td style={{ fontWeight: 600 }}>&quot;{item.query}&quot;</td>
                      <td><span className="admin-badge" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>{item.count}</span></td>
                    </tr>
                  ))}
                  {topSearches.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '40px' }}>No searches recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
