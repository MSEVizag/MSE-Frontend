"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Product } from '../types';
import ProductPreviewCanvas from './ProductPreviewCanvas';
import '../app/catalog/catalog.css';
import { z } from 'zod';

const testimonialSchema = z.object({
  customerName: z.string().min(1, "Customer name is required").max(150),
  businessName: z.string().max(200).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  buyerType: z.enum(['site_buyer', 'store_buyer', 'unverified']).default('site_buyer'),
  isVerifiedPurchase: z.boolean().default(true),
  rating: z.number().min(1).max(5),
  title: z.string().max(255).optional(),
  description: z.string().min(1, "Description is required"),
  imageFilenames: z.array(z.string()).default([])
});

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
    brand: '',
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
    testimonials: [{ customerName: '', businessName: '', email: '', buyerType: 'site_buyer', isVerifiedPurchase: true, rating: 5, title: '', description: '', imageFilenames: [] as string[] }],
    documents: [{ label: '', url: '' }],
    contactConfig: { phone: '', enableRfqModal: true }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('specs');
  const [testimonialErrors, setTestimonialErrors] = useState<{ [index: number]: any }>({});
  
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  
  const [brandsList, setBrandsList] = useState<string[]>([]);
  const [newBrandInput, setNewBrandInput] = useState('');
  const [showNewBrandInput, setShowNewBrandInput] = useState(false);

  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  useEffect(() => {
    fetch('/api/variables')
      .then(res => res.json())
      .then(data => {
        if (data.variables?.brands) {
          setBrandsList(data.variables.brands);
        }
        if (data.variables?.categories) {
          setCategoriesList(data.variables.categories);
        }
      })
      .catch(console.error);
  }, []);

  const handleAddNewBrand = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newBrandInput.trim()) return;
    
    try {
      const res = await fetch('/api/variables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'brand', value: newBrandInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setBrandsList(data.variables.brands);
        setNewProduct(prev => ({ ...prev, brand: newBrandInput.trim() }));
        setShowNewBrandInput(false);
        setNewBrandInput('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNewCategory = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCategoryInput.trim()) return;
    
    try {
      const res = await fetch('/api/variables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category', value: newCategoryInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setCategoriesList(data.variables.categories);
        setNewProduct(prev => ({ ...prev, category: newCategoryInput.trim() }));
        setShowNewCategoryInput(false);
        setNewCategoryInput('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAttribute = async (type: 'brand' | 'category', value: string) => {
    if (!window.confirm(`Are you sure you want to delete the ${type} "${value}"?`)) return;
    try {
      const res = await fetch('/api/variables', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value })
      });
      const data = await res.json();
      if (data.success) {
        if (type === 'brand') {
          setBrandsList(data.variables.brands);
          if (newProduct.brand === value) setNewProduct(prev => ({ ...prev, brand: '' }));
        } else {
          setCategoriesList(data.variables.categories);
          if (newProduct.category === value) setNewProduct(prev => ({ ...prev, category: '' }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

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
      try {
        localStorage.setItem('admin_product_draft', JSON.stringify(newProduct));
      } catch (err: any) {
        if (err.name === 'QuotaExceededError' || err.message.includes('quota')) {
          try {
            const fallbackDraft = { ...newProduct, image: '', thumbnails: [] };
            localStorage.setItem('admin_product_draft', JSON.stringify(fallbackDraft));
            console.warn('Draft images were too large, saved draft without images.');
          } catch (fallbackErr) {
            console.error('Failed to save draft to localStorage', fallbackErr);
          }
        } else {
          console.error('Failed to save draft to localStorage', err);
        }
      }
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

  const uploadBase64ToR2 = async (base64Str: string, productId: string, filename: string) => {
    if (!base64Str.startsWith('data:image/')) return base64Str; // Already a URL or empty
    
    const mimeType = base64Str.substring(base64Str.indexOf(':') + 1, base64Str.indexOf(';'));
    const authRes = await fetch('/api/upload-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, filename, contentType: mimeType })
    });
    
    const authData = await authRes.json();
    if (!authData.success) throw new Error('Failed to get upload URL');

    const base64Data = base64Str.split(',')[1];
    const byteString = atob(base64Data);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeType });

    await fetch(authData.presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': mimeType },
      body: blob
    });

    return authData.cdnUrl;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasErrors = false;
    const errors: any = {};
    newProduct.testimonials.forEach((t, i) => {
      const result = testimonialSchema.safeParse(t);
      if (!result.success) {
        hasErrors = true;
        errors[i] = result.error.flatten().fieldErrors;
      }
    });
    if (hasErrors) {
      setTestimonialErrors(errors);
      alert('Please fix validation errors in the testimonials section.');
      return;
    }
    setTestimonialErrors({});
    
    setIsSubmitting(true);
    
    try {
      const productId = crypto.randomUUID();
      
      // Upload all thumbnails to R2
      const imagesToUpload = newProduct.thumbnails?.length > 0 ? newProduct.thumbnails : (newProduct.image ? [newProduct.image] : []);
      const uploadedThumbnails = await Promise.all(
        imagesToUpload.map(async (imgBase64, index) => {
          return await uploadBase64ToR2(imgBase64, productId, `image_${index}.jpg`);
        })
      );
      
      const finalImage = uploadedThumbnails[0] || '';
      
      const payload = {
        ...newProduct,
        id: productId,
        visibilityStatus: 'published',
        moq: Number(newProduct.moq) || 1,
        image: finalImage,
        specs: newProduct.specs.filter(s => s.label && s.value), // Remove empty specs
        features: [{ title: "NEW PRODUCT", desc: "Added from Admin Panel", icon: "ri-star-line" }], // Default placeholder
        thumbnails: uploadedThumbnails,
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
          title: '', category: 'MINI CRANES', brand: '', description: '', image: '', thumbnails: [] as string[], specs: [{ label: '', value: '' }], tag: '', videoUrl: '',
          documents: [{ label: '', url: '' }], badges: [] as string[], moq: 1 as number | string, stockStatus: 'In Stock - Ships in 48hrs', 
          pricingTiers: [{ minQty: 1, maxQty: 10, price: 0 }], hideExactPrices: false, 
          testimonials: [{ customerName: '', businessName: '', email: '', buyerType: 'site_buyer', isVerifiedPurchase: true, rating: 5, title: '', description: '', imageFilenames: [] as string[] }], 
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

  const handleCancel = () => {
    setShowCloseModal(true);
  };

  const executeCancel = () => {
    setNewProduct({ 
      title: '', category: 'MINI CRANES', brand: '', description: '', image: '', thumbnails: [] as string[], specs: [{ label: '', value: '' }], tag: '', videoUrl: '',
      documents: [{ label: '', url: '' }], badges: [] as string[], moq: 1 as number | string, stockStatus: 'In Stock - Ships in 48hrs', 
      pricingTiers: [{ minQty: 1, maxQty: 10, price: 0 }], hideExactPrices: false, 
      testimonials: [{ customerName: '', businessName: '', email: '', buyerType: 'site_buyer', isVerifiedPurchase: true, rating: 5, title: '', description: '', imageFilenames: [] as string[] }], 
      contactConfig: { phone: '', enableRfqModal: true } 
    });
    localStorage.removeItem('admin_product_draft');
    router.push('/admin');
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const productId = crypto.randomUUID();
      
      const imagesToUpload = newProduct.thumbnails?.length > 0 ? newProduct.thumbnails : (newProduct.image ? [newProduct.image] : []);
      const uploadedThumbnails = await Promise.all(
        imagesToUpload.map(async (imgBase64, index) => {
          return await uploadBase64ToR2(imgBase64, productId, `image_${index}.jpg`);
        })
      );
      
      const finalImage = uploadedThumbnails[0] || '';

      const payload = {
        ...newProduct,
        id: productId,
        visibilityStatus: 'draft',
        moq: Number(newProduct.moq) || 1,
        image: finalImage,
        specs: newProduct.specs.filter(s => s.label && s.value),
        features: [{ title: "NEW PRODUCT", desc: "Added from Admin Panel", icon: "ri-star-line" }],
        thumbnails: uploadedThumbnails,
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
        alert('Draft Saved Successfully!');
        localStorage.removeItem('admin_product_draft');
        router.push('/admin');
      } else {
        alert('Error saving draft: ' + data.error);
      }
    } catch (err) {
      alert('Error saving draft');
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 24px', borderBottom: '1px solid #334155', marginBottom: '1.5rem' }}>
          {!isSidebarCollapsed && <h2 style={{ padding: 0, border: 'none', margin: 0 }}>MS Admin</h2>}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '1.25rem', padding: 0, margin: isSidebarCollapsed ? '0 auto' : 0 }}
          >
            <i className={isSidebarCollapsed ? 'ri-menu-unfold-line' : 'ri-menu-fold-line'}></i>
          </button>
        </div>
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'catalog' ? 'active' : ''}`} onClick={() => router.push('/admin')} title="Products">
            <i className="ri-list-check"></i> {!isSidebarCollapsed && "Products"}
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
                <h1>Products</h1>
                <p>Manage your {catalog.length} active products.</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button 
                  onClick={() => {
                    setNewProduct({ 
                      title: '', category: 'MINI CRANES', brand: '', description: '', image: '', thumbnails: [] as string[], specs: [{ label: '', value: '' }], tag: '', videoUrl: '',
                      documents: [{ label: '', url: '' }], badges: [] as string[], moq: 1 as number | string, stockStatus: 'In Stock - Ships in 48hrs', 
                      pricingTiers: [{ minQty: 1, maxQty: 10, price: 0 }], hideExactPrices: false, 
                      testimonials: [{ customerName: '', businessName: '', email: '', buyerType: 'site_buyer', isVerifiedPurchase: true, rating: 5, title: '', description: '', imageFilenames: [] as string[] }], 
                      contactConfig: { phone: '', enableRfqModal: true } 
                    });
                    router.push('/admin/add-item');
                  }}
                  className="admin-btn admin-btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '10px 16px' }}
                >
                  <i className="ri-add-line"></i> Add Product
                </button>
                <div style={{ position: 'relative' }}>
                  <i className="ri-search-line" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    style={{ padding: '10px 12px 10px 36px', borderRadius: '0.375rem', border: '1px solid #cbd5e1', width: '15.625rem', fontSize: '0.875rem' }}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
              {filteredCatalog.map((p: any) => (
                <div key={p.id} className="admin-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '180px', overflow: 'hidden', position: 'relative', background: '#f8fafc' }}>
                    <img src={p.image || 'https://placehold.co/400x300?text=No+Image'} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span className="admin-badge" style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>{p.category}</span>
                  </div>
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', color: '#0f172a' }}>{p.title}</h3>
                    <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.875rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description || 'No description available.'}</p>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                      <Link 
                        href={`/catalog/${p.id}`}
                        target="_blank"
                        className="admin-btn admin-btn-secondary"
                        style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}
                      >
                        <i className="ri-eye-line"></i> View
                      </Link>
                      <button 
                        onClick={() => {
                          setNewProduct({
                            ...p,
                            hideExactPrices: p.hideExactPrices || false,
                            testimonials: p.testimonials?.length ? p.testimonials : [{ customerName: '', businessName: '', email: '', buyerType: 'site_buyer', isVerifiedPurchase: true, rating: 5, title: '', description: '', imageFilenames: [] as string[] }],
                            pricingTiers: p.pricingTiers?.length ? p.pricingTiers : [{ minQty: 1, maxQty: 10, price: 0 }],
                            specs: p.specs?.length ? p.specs : [{ label: '', value: '' }]
                          });
                          router.push('/admin/add-item');
                        }}
                        className="admin-btn admin-btn-primary"
                        style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <i className="ri-edit-line"></i> Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredCatalog.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '0.5rem', border: '1px dashed #cbd5e1' }}>
                  <i className="ri-inbox-line" style={{ fontSize: '3rem', color: '#94a3b8', marginBottom: '1rem', display: 'block' }}></i>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>No products found</h3>
                  <p style={{ margin: 0, color: '#64748b' }}>Try adjusting your search or add a new product.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div>
            <div className="admin-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <h1 style={{ margin: 0 }}>Add New Product</h1>
                <p style={{ margin: '0.25rem 0 0 0' }}>Publish new equipment directly to your catalog.</p>
              </div>
              <button 
                onClick={() => setShowCloseModal(true)} 
                style={{ background: 'transparent', border: 'none', fontSize: '1.75rem', cursor: 'pointer', color: '#64748b', padding: '0', display: 'flex', alignItems: 'center' }}
                title="Close"
              >
                <i className="ri-close-line"></i>
              </button>
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
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select 
                          id="category" 
                          value={newProduct.category} 
                          onChange={e => {
                            if (e.target.value === 'add_new') {
                              setShowNewCategoryInput(true);
                            } else {
                              setShowNewCategoryInput(false);
                              setNewProduct({...newProduct, category: e.target.value});
                            }
                          }}
                          style={{ flex: 1 }}
                        >
                          <option value="">Select Category</option>
                          {categoriesList.map((cat, i) => (
                            <option key={i} value={cat}>{cat}</option>
                          ))}
                          <option value="add_new">+ Add Category</option>
                        </select>
                        {newProduct.category && newProduct.category !== 'add_new' && (
                          <button 
                            type="button" 
                            onClick={() => handleDeleteAttribute('category', newProduct.category)}
                            title="Delete Selected Category"
                            style={{ padding: '0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <i className="ri-close-line" style={{ fontSize: '1.25rem' }}></i>
                          </button>
                        )}
                      </div>
                      {showNewCategoryInput && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <input 
                            type="text" 
                            value={newCategoryInput}
                            onChange={(e) => setNewCategoryInput(e.target.value)}
                            placeholder="Enter new category" 
                            style={{ flex: 1, padding: '10px 12px', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                          />
                          <button onClick={handleAddNewCategory} type="button" className="admin-btn admin-btn-primary" style={{ padding: '8px 16px' }}>Add</button>
                          <button onClick={() => setShowNewCategoryInput(false)} type="button" className="admin-btn admin-btn-secondary" style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: 'none' }}>Cancel</button>
                        </div>
                      )}
                    </div>
                    <div className="admin-form-group">
                      <label htmlFor="brand">Brand</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select 
                          id="brand" 
                          value={newProduct.brand} 
                          onChange={e => {
                            if (e.target.value === 'add_new') {
                              setShowNewBrandInput(true);
                            } else {
                              setShowNewBrandInput(false);
                              setNewProduct({...newProduct, brand: e.target.value});
                            }
                          }}
                          style={{ flex: 1 }}
                        >
                          <option value="">Select Brand</option>
                          {brandsList.map((brand, i) => (
                            <option key={i} value={brand}>{brand}</option>
                          ))}
                          <option value="add_new">+ Add Brand</option>
                        </select>
                        {newProduct.brand && newProduct.brand !== 'add_new' && (
                          <button 
                            type="button" 
                            onClick={() => handleDeleteAttribute('brand', newProduct.brand)}
                            title="Delete Selected Brand"
                            style={{ padding: '0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <i className="ri-close-line" style={{ fontSize: '1.25rem' }}></i>
                          </button>
                        )}
                      </div>
                      {showNewBrandInput && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <input 
                            type="text" 
                            value={newBrandInput}
                            onChange={(e) => setNewBrandInput(e.target.value)}
                            placeholder="Enter new brand name" 
                            style={{ flex: 1, padding: '10px 12px', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                          />
                          <button onClick={handleAddNewBrand} type="button" className="admin-btn admin-btn-primary" style={{ padding: '8px 16px' }}>Add</button>
                          <button onClick={() => setShowNewBrandInput(false)} type="button" className="admin-btn admin-btn-secondary" style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: 'none' }}>Cancel</button>
                        </div>
                      )}
                    </div>
                    <div className="admin-form-group">
                      <label htmlFor="image">Product Images (Up to 12)</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                          style={{ padding: '0.625rem', border: '1px dashed #cbd5e1', borderRadius: '0.375rem', background: '#f8fafc', cursor: 'pointer', fontSize: '0.8125rem' }}
                        />
                        {newProduct.thumbnails && newProduct.thumbnails.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {newProduct.thumbnails.map((img, i) => (
                              <div key={i} className="admin-image-preview-wrapper" style={{ position: 'relative' }}>
                                <img src={img} alt={`Preview ${i}`} style={{ width: '3.75rem', height: '3.75rem', objectFit: 'cover', borderRadius: '0.25rem', border: '1px solid #e2e8f0' }} />
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {newProduct.specs.map((spec, index) => (
                          <div key={index} style={{ display: 'flex', gap: '0.5rem' }}>
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
                            }} style={{ padding: '0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => setNewProduct({...newProduct, specs: [...newProduct.specs, { label: '', value: '' }]})} style={{ alignSelf: 'flex-start', padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#475569' }}>
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
                    <div style={{ display: 'flex', gap: '1rem' }}>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {newProduct.pricingTiers.map((tier, index) => (
                          <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input type="number" value={tier.minQty} onChange={(e) => {
                              const newTiers = [...newProduct.pricingTiers];
                              newTiers[index].minQty = parseInt(e.target.value) || 0;
                              setNewProduct({...newProduct, pricingTiers: newTiers});
                            }} placeholder="Min Qty" style={{ width: '5rem' }} />
                            <span>to</span>
                            <input type="number" value={tier.maxQty} onChange={(e) => {
                              const newTiers = [...newProduct.pricingTiers];
                              newTiers[index].maxQty = parseInt(e.target.value) || 0;
                              setNewProduct({...newProduct, pricingTiers: newTiers});
                            }} placeholder="Max Qty" style={{ width: '5rem' }} />
                            <span>→ $</span>
                            <input type="number" value={tier.price} onChange={(e) => {
                              const newTiers = [...newProduct.pricingTiers];
                              newTiers[index].price = parseInt(e.target.value) || 0;
                              setNewProduct({...newProduct, pricingTiers: newTiers});
                            }} placeholder="Price" style={{ flex: 1 }} />
                            <button type="button" onClick={() => {
                              const newTiers = newProduct.pricingTiers.filter((_, i) => i !== index);
                              setNewProduct({...newProduct, pricingTiers: newTiers});
                            }} style={{ padding: '0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => setNewProduct({...newProduct, pricingTiers: [...newProduct.pricingTiers, { minQty: 0, maxQty: 0, price: 0 }]})} style={{ alignSelf: 'flex-start', padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#475569' }}>
                          + Add Pricing Tier
                        </button>
                      </div>
                    </div>

                    <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={newProduct.hideExactPrices} onChange={e => setNewProduct({...newProduct, hideExactPrices: e.target.checked})} />
                        <span className="toggle-slider"></span>
                      </label>
                      <span style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 500 }}>Hide exact prices on public page (Show "Request Tiered Quote")</span>
                    </div>
                  </details>

                  <details className="admin-fieldset">
                    <summary><i className="ri-message-2-line"></i> Client Testimonials & Projects <i className="ri-arrow-down-s-line" style={{ marginLeft: 'auto' }}></i></summary>
                    <div className="admin-form-group">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {newProduct.testimonials.map((test, index) => (
                          <div key={index} style={{ border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '0.5rem', background: '#fff', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <input type="text" value={test.customerName} onChange={(e) => {
                                  const newTests = [...newProduct.testimonials];
                                  newTests[index].customerName = e.target.value;
                                  setNewProduct({...newProduct, testimonials: newTests});
                                }} placeholder="Customer Name *" />
                                {testimonialErrors[index]?.customerName && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{testimonialErrors[index].customerName[0]}</span>}
                              </div>
                              <div style={{ flex: 1 }}>
                                <input type="text" value={test.businessName} onChange={(e) => {
                                  const newTests = [...newProduct.testimonials];
                                  newTests[index].businessName = e.target.value;
                                  setNewProduct({...newProduct, testimonials: newTests});
                                }} placeholder="Business Name (Optional)" />
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <input type="email" value={test.email} onChange={(e) => {
                                  const newTests = [...newProduct.testimonials];
                                  newTests[index].email = e.target.value;
                                  setNewProduct({...newProduct, testimonials: newTests});
                                }} placeholder="Email (Optional)" />
                                {testimonialErrors[index]?.email && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{testimonialErrors[index].email[0]}</span>}
                              </div>
                              <div style={{ flex: 1 }}>
                                <select value={test.buyerType} onChange={(e) => {
                                  const newTests = [...newProduct.testimonials];
                                  newTests[index].buyerType = e.target.value;
                                  setNewProduct({...newProduct, testimonials: newTests});
                                }}>
                                  <option value="site_buyer">Site Buyer</option>
                                  <option value="store_buyer">Store Buyer</option>
                                  <option value="unverified">Unverified</option>
                                </select>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                              <div style={{ flex: 2 }}>
                                <input type="text" value={test.title} onChange={(e) => {
                                  const newTests = [...newProduct.testimonials];
                                  newTests[index].title = e.target.value;
                                  setNewProduct({...newProduct, testimonials: newTests});
                                }} placeholder="Headline (Optional)" />
                              </div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <input type="number" min="1" max="5" value={test.rating} onChange={(e) => {
                                  const newTests = [...newProduct.testimonials];
                                  newTests[index].rating = parseInt(e.target.value) || 5;
                                  setNewProduct({...newProduct, testimonials: newTests});
                                }} placeholder="Rating (1-5)" />
                                {testimonialErrors[index]?.rating && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{testimonialErrors[index].rating[0]}</span>}
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <textarea rows={2} value={test.description} onChange={(e) => {
                                const newTests = [...newProduct.testimonials];
                                newTests[index].description = e.target.value;
                                setNewProduct({...newProduct, testimonials: newTests});
                              }} placeholder="Review Description *"></textarea>
                              {testimonialErrors[index]?.description && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{testimonialErrors[index].description[0]}</span>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Testimonial Images (Base64 for preview, will be uploaded later)</label>
                              <input type="file" multiple accept="image/*" onChange={async (e) => {
                                const files = Array.from(e.target.files || []);
                                if (files.length > 0) {
                                  const base64Images = await Promise.all(files.map((file) => new Promise<string>((resolve) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve(reader.result as string);
                                    reader.readAsDataURL(file);
                                  })));
                                  const newTests = [...newProduct.testimonials];
                                  newTests[index].imageFilenames = [...(newTests[index].imageFilenames || []), ...base64Images];
                                  setNewProduct({...newProduct, testimonials: newTests});
                                }
                              }} style={{ fontSize: '0.75rem' }} />
                              {test.imageFilenames && test.imageFilenames.length > 0 && (
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                  {test.imageFilenames.map((img, i) => (
                                    <div key={i} style={{ position: 'relative' }}>
                                      <img src={img} style={{ width: '2rem', height: '2rem', objectFit: 'cover' }} alt="testimonial" />
                                      <button type="button" onClick={() => {
                                        const newTests = [...newProduct.testimonials];
                                        newTests[index].imageFilenames = newTests[index].imageFilenames.filter((_, imgIdx) => imgIdx !== i);
                                        setNewProduct({...newProduct, testimonials: newTests});
                                      }} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '1rem', height: '1rem', fontSize: '0.5rem' }}>x</button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" id={`verified-${index}`} checked={test.isVerifiedPurchase} style={{ width: 'auto' }} onChange={(e) => {
                                  const newTests = [...newProduct.testimonials];
                                  newTests[index].isVerifiedPurchase = e.target.checked;
                                  setNewProduct({...newProduct, testimonials: newTests});
                                }} />
                                <label htmlFor={`verified-${index}`} style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 500, whiteSpace: 'nowrap', display: 'inline' }}>Verified Purchase</label>
                              </div>
                              <button type="button" onClick={() => {
                                const newTests = newProduct.testimonials.filter((_, i) => i !== index);
                                setNewProduct({...newProduct, testimonials: newTests});
                              }} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>Remove</button>
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={() => setNewProduct({...newProduct, testimonials: [...newProduct.testimonials, { customerName: '', businessName: '', email: '', buyerType: 'site_buyer', isVerifiedPurchase: true, rating: 5, title: '', description: '', imageFilenames: [] }]})} style={{ alignSelf: 'flex-start', padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#475569' }}>
                          + Add Testimonial
                        </button>
                      </div>
                    </div>
                  </details>


                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button type="button" onClick={handleCancel} disabled={isSubmitting} style={{ flex: 1, padding: '1rem', fontSize: '1rem', background: '#ef4444', border: '1px solid #dc2626', color: '#ffffff', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}>
                        Delete
                      </button>
                      <button type="submit" className="admin-btn-primary" disabled={isSubmitting} style={{ flex: 1, padding: '1rem', fontSize: '1rem', borderRadius: '0.25rem' }}>
                        {isSubmitting ? 'Publishing...' : 'Publish'}
                      </button>
                    </div>
                    <button type="button" onClick={handleSaveDraft} disabled={isSubmitting} style={{ width: '100%', padding: '1rem', fontSize: '1rem', background: '#3b82f6', border: '1px solid #2563eb', color: '#ffffff', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}>
                      Save as Draft
                    </button>
                  </div>
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
                        <div style={{ fontSize: '0.8125rem' }}>{q.email}</div>
                        <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{q.phone}</div>
                      </td>
                      <td><span className="admin-badge">{q.context}</span></td>
                      <td>{q.quantity || '-'}</td>
                      <td style={{ fontSize: '0.75rem', color: '#94a3b8' }}>#{q.id}</td>
                    </tr>
                  ))}
                  {initialQuotes.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem' }}>No quote requests yet.</td>
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

            <div className="analytics-grid" style={{ marginBottom: '2rem' }}>
              <div className="analytics-card">
                <span className="analytics-card-title">Total Searches</span>
                <span className="analytics-card-value">{initialSearchLogs.length}</span>
              </div>
              <div className="analytics-card">
                <span className="analytics-card-title">Unique Terms</span>
                <span className="analytics-card-value">{topSearches.length}</span>
              </div>
            </div>

            <div className="admin-card admin-table-container" style={{ maxWidth: '37.5rem' }}>
              <h3>Top Searched Words</h3>
              <table className="admin-table" style={{ marginTop: '1rem' }}>
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
                      <td colSpan={3} style={{ textAlign: 'center', padding: '2.5rem' }}>No searches recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modals for Add Item */}
      {showCloseModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeInBlur 0.2s ease-out forwards' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '0.5rem', width: '90%', maxWidth: '400px', position: 'relative', animation: 'popIn 0.2s ease-out forwards' }}>
            <button 
              onClick={() => setShowCloseModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
            >
              <i className="ri-close-line"></i>
            </button>
            <h2 style={{ marginTop: 0, color: '#0f172a', fontSize: '1.75rem', fontWeight: 800 }}>Save Progress?</h2>
            <p style={{ color: '#475569', marginBottom: '1.5rem' }}>Would you like to save your current progress as a draft before leaving?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={() => {
                  handleSaveDraft();
                  setShowCloseModal(false);
                }}
                className="admin-btn admin-btn-primary"
                style={{ padding: '0.75rem' }}
              >
                Save as draft
              </button>
              <button 
                onClick={() => {
                  setShowCloseModal(false);
                  setShowConfirmCancelModal(true);
                }}
                className="admin-btn admin-btn-secondary"
                style={{ background: '#f8fafc', color: '#ef4444', border: '1px solid #fee2e2', padding: '0.75rem' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmCancelModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeInBlur 0.2s ease-out forwards' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '0.5rem', width: '90%', maxWidth: '400px', animation: 'popIn 0.2s ease-out forwards' }}>
            <h2 style={{ marginTop: 0, color: '#0f172a', fontSize: '1.75rem', fontWeight: 800 }}>Are you sure?</h2>
            <p style={{ color: '#475569', marginBottom: '1.5rem' }}>Are you sure you want to delete this draft? You will lose all your current progress.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => {
                  setShowConfirmCancelModal(false);
                  setShowCloseModal(true);
                }}
                className="admin-btn admin-btn-secondary"
                style={{ flex: 1, padding: '0.75rem' }}
              >
                No
              </button>
              <button 
                onClick={() => {
                  setShowConfirmCancelModal(false);
                  executeCancel();
                }}
                className="admin-btn admin-btn-primary"
                style={{ flex: 1, background: '#ef4444', borderColor: '#ef4444', padding: '0.75rem' }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
