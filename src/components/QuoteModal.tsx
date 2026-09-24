import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import './QuoteModal.css';

interface QuoteModalProps {}

export default function QuoteModal(props: QuoteModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [productContext, setProductContext] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    quantity: '',
    requirements: ''
  });
  const [submittedData, setSubmittedData] = useState<any>(null);

  useEffect(() => {
    const handleOpen = (e: any) => {
      setIsOpen(true);
      setStatus('idle');
      if (e.detail && e.detail.productTitle) {
        setProductContext(`Interested in: ${e.detail.productTitle} (ID: ${e.detail.productId})`);
        setFormData(prev => ({ ...prev, requirements: `I would like a quote for ${e.detail.productTitle}.\n\n` }));
      } else {
        setProductContext('General Inquiry');
        setFormData(prev => ({ ...prev, requirements: '' }));
      }
      setSubmittedData(null);
    };
    
    window.addEventListener('open-quote-modal', handleOpen);
    return () => window.removeEventListener('open-quote-modal', handleOpen);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          context: productContext,
          url: window.location.href
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      const data = await response.json();

      setStatus('success');
      setSubmittedData({ ...formData, context: productContext, id: data.id });
      // Reset form
      setFormData({ name: '', email: '', phone: '', quantity: '', requirements: '' });
      
      // // Auto close after 3 seconds - Disabled to allow user to click WhatsApp
      // setTimeout(() => {
      //   setIsOpen(false);
      // }, 3000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  const generateWaUrl = () => {
    if (!submittedData) return '';
    const BUSINESS_NUMBER = "917984627108";
    const qtyText = submittedData.quantity ? `\nQuantity: ${submittedData.quantity}` : '';
    const pageUrl = window.location.href;
    const quoteIdText = submittedData.id ? `\nQuote ID: ${submittedData.id}` : '';
    const message = `Hello MS Engineering,\nI just submitted a quote request.${quoteIdText}\n\nName: ${submittedData.name}\nEmail: ${submittedData.email}\nPhone: ${submittedData.phone}${qtyText}\nContext: ${submittedData.context}\nURL: ${pageUrl}\n\nRequirements:\n${submittedData.requirements}`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${BUSINESS_NUMBER}?text=${encodedMessage}`;
  };

  const handleWhatsAppFallback = () => {
    const url = generateWaUrl();
    if (url) window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="quote-modal-overlay" onClick={() => setIsOpen(false)}>
      <div className="quote-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="quote-close-btn" onClick={() => setIsOpen(false)}>
          <i className="ri-close-line"></i>
        </button>
        
        <div className="quote-header">
          <h2>Request a Quote</h2>
          <div className="orange-underline"></div>
          {productContext && <p className="quote-context">{productContext}</p>}
        </div>

        {status === 'success' ? (
          <div className="quote-success">
            <i className="ri-checkbox-circle-fill"></i>
            <h3>Request Sent Successfully!</h3>
            <p>Our engineering team will get back to you within 24 hours.</p>
            
            <div className="wa-fallback-box" style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f0f9f4', borderRadius: '8px', border: '1px solid #c3e6cb', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#155724', marginBottom: '12px', lineHeight: '1.4' }}>
                  Need a faster response? Send your request details directly via WhatsApp!
                </p>
                <button onClick={handleWhatsAppFallback} className="btn-whatsapp" style={{ width: 'auto', padding: '8px 16px', fontSize: '12px', margin: '0', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ri-whatsapp-line" style={{ fontSize: '16px' }}></i> REQUEST ON WHATSAPP
                </button>
              </div>
              <div className="wa-qr-container">
                {submittedData && <QRCode value={generateWaUrl()} size={110} />}
                <p>Scan to send</p>
              </div>
            </div>
          </div>
        ) : (
          <form className="quote-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label htmlFor="quantity">Quantity (Optional)</label>
                <input type="number" id="quantity" name="quantity" min="1" value={formData.quantity} onChange={handleChange} placeholder="1" />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} placeholder="john@company.com" />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input type="tel" id="phone" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="requirements">Project Requirements *</label>
              <textarea id="requirements" name="requirements" required rows={4} value={formData.requirements} onChange={handleChange} placeholder="Please describe your specific technical requirements..." />
            </div>
            
            {status === 'error' && <p className="error-msg">{errorMessage}</p>}
            
            <button type="submit" className="btn-submit-quote" disabled={status === 'loading'}>
              {status === 'loading' ? 'SENDING...' : 'SEND REQUEST'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
