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
    <div className="min-h-screen bg-[#EBEBEB] font-sans selection:bg-[#1855a8] selection:text-white pb-6 pt-6">
      <ComingSoonModal />

      {/* Main Container - Ensures perfect alignment for all boxes */}
      <main className="max-w-[1440px] mx-auto px-4 md:px-6 flex flex-col gap-6">
        
        {/* HERO SECTION */}
        <section className="bg-[#F5F5F5] rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-16 relative overflow-hidden flex flex-col min-h-[85vh]">
          {/* Top Navbar inside Hero */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center w-full relative z-20 gap-6">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200/50 shadow-sm">
              <span className="text-xs font-medium text-gray-700">sales@msengineering.com</span>
              <button className="bg-white hover:bg-gray-50 text-gray-800 rounded-full px-3 py-1 text-[10px] font-semibold transition-colors shadow-sm border border-gray-100">Copy</button>
              <button className="bg-white hover:bg-gray-50 text-gray-800 rounded-full px-3 py-1 text-[10px] font-semibold transition-colors shadow-sm border border-gray-100 ml-1">Get in touch</button>
            </div>
            
            <nav className="flex gap-6 text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
              <Link href="#" className="hover:text-black transition-colors">LinkedIn</Link>
              <Link href="#" className="hover:text-black transition-colors">Dribbble</Link>
              <Link href="#" className="hover:text-black transition-colors">Instagram</Link>
            </nav>
          </header>

          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
          
          <div className="flex-grow flex flex-col items-center justify-center relative z-10 text-center mt-12 md:mt-0">
            <div className="w-16 h-16 rounded-full mb-8 flex items-center justify-center overflow-hidden border-[3px] border-white shadow-sm relative group bg-white">
               {/* Minimal Logo / Icon */}
               <i className="ri-building-4-line text-2xl text-gray-800 group-hover:scale-110 transition-transform duration-500"></i>
               <div className="absolute -right-2 -top-1 bg-[#1855a8] text-white text-[9px] font-bold px-2 py-0.5 rounded-full transform rotate-[15deg]">
                 MS
               </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-medium text-[#111] tracking-[-0.03em] leading-[1.05] max-w-4xl mx-auto mb-10">
              Building digital products, brands, and experience.
            </h1>
            
            <Link href="/catalog" className="bg-[#111] hover:bg-black text-white font-medium py-4 px-10 rounded-full transition-transform hover:-translate-y-0.5 flex items-center gap-2 text-sm">
              Latest Shots
            </Link>
          </div>
        </section>

        {/* LOGO TICKER SECTION */}
        <section className="bg-white rounded-[2.5rem] md:rounded-[3rem] px-8 py-10 md:py-12 overflow-hidden flex items-center justify-center">
           <LogoTicker />
        </section>

        {/* SERVICES / ABOUT SECTION (Mixed Blueprint) */}
        <section id="services" className="bg-[#FAFAFA] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden">
          {/* Top White Area */}
          <div className="p-8 md:p-16 lg:p-20">
            <div className="flex justify-between items-center mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#1855a8]">COREAXIS</span>
              <nav className="hidden md:flex gap-8 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                <Link href="#" className="hover:text-[#111] transition-colors">Home</Link>
                <Link href="#" className="hover:text-[#111] transition-colors">About</Link>
                <Link href="#" className="text-[#1855a8]">Services</Link>
              </nav>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#111] tracking-[-0.02em] mb-8">
              MECHANICAL DESIGN ENGINEERING
            </h2>
            <p className="text-[#555] max-w-3xl text-sm md:text-base leading-relaxed mb-16 font-medium">
              From upstream extraction systems to downstream processing facilities, we design precision-engineered mechanical components that withstand the harshest environments in the oil and gas industry.
            </p>

            <div className="grid md:grid-cols-3 gap-12 md:gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-4 h-4 rounded-full bg-[#1855a8]"></div>
                  <h4 className="font-semibold text-[#111] text-base">Equipment Design & Integration</h4>
                </div>
                <p className="text-sm text-[#555] leading-relaxed">
                  We develop custom solutions—from pressure vessels and heat exchangers to rotating equipment—tailored to performance, efficiency, and regulatory requirements.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-4 h-4 rounded-full bg-[#1855a8]"></div>
                  <h4 className="font-semibold text-[#111] text-base">Pipeline & Structural Systems</h4>
                </div>
                <p className="text-sm text-[#555] leading-relaxed">
                  Our teams engineer mechanically sound pipeline supports, pressure containment systems, and modular skids built for stability and adaptability in the field.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-4 h-4 rounded-full bg-[#1855a8]"></div>
                  <h4 className="font-semibold text-[#111] text-base">Quality Assurance & Testing</h4>
                </div>
                <p className="text-sm text-[#555] leading-relaxed">
                  We implement rigorous testing protocols to ensure that every design meets industry standards and client specifications, guaranteeing reliability and safety.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Blueprint Area */}
          <div className="bg-[#1855a8] text-white border-t-2 border-white/20 flex flex-col lg:flex-row relative">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            <div className="lg:w-1/2 p-12 md:p-20 border-b-2 lg:border-b-0 lg:border-r-2 border-white/20 flex items-center justify-center min-h-[400px] relative z-10">
               {/* Minimal Blueprint Graphic */}
               <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-white/40 rounded-3xl transform -rotate-6"></div>
                  <div className="absolute inset-0 border-2 border-white/20 rounded-3xl transform rotate-3"></div>
                  <i className="ri-building-2-line text-8xl text-white/80"></i>
               </div>
            </div>
            
            <div className="lg:w-1/2 flex flex-col relative z-10">
              <div className="flex-grow">
                <div className="flex items-stretch border-b-2 border-white/20 hover:bg-white/5 transition-colors cursor-default">
                  <div className="p-6 md:px-10 md:py-8 border-r-2 border-white/20 font-mono text-sm opacity-80 flex items-center justify-center min-w-[100px]">01</div>
                  <div className="p-6 md:px-10 md:py-8 font-medium text-base md:text-lg flex items-center">Multidisciplinary Collaboration</div>
                </div>
                <div className="flex items-stretch border-b-2 border-white/20 hover:bg-white/5 transition-colors cursor-default">
                  <div className="p-6 md:px-10 md:py-8 border-r-2 border-white/20 font-mono text-sm opacity-80 flex items-center justify-center min-w-[100px]">02</div>
                  <div className="p-6 md:px-10 md:py-8 font-medium text-base md:text-lg flex items-center text-[#eb5e28]">Compliance-Driven Design</div>
                </div>
                <div className="flex items-stretch border-b-2 border-white/20 hover:bg-white/5 transition-colors cursor-default">
                  <div className="p-6 md:px-10 md:py-8 border-r-2 border-white/20 font-mono text-sm opacity-80 flex items-center justify-center min-w-[100px]">03</div>
                  <div className="p-6 md:px-10 md:py-8 font-medium text-base md:text-lg flex items-center">Design for Manufacturability</div>
                </div>
              </div>
              
              <div className="p-8 md:p-10 flex flex-col justify-end">
                <p className="text-sm italic opacity-80 mb-6 font-serif">Engineered for Performance. Built for Extremes.</p>
                <h3 className="text-2xl md:text-[2rem] font-bold leading-[1.2] mb-12 max-w-lg">
                  ALL DELIVERABLES ARE ALIGNED WITH ASME, ISO, AND CLIENT-SPECIFIC STANDARDS
                </h3>
                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest border-t-2 border-white/20 pt-6 opacity-90">
                  <span>Coreaxis Technologies</span>
                  <span>2024</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-12 md:p-24 lg:p-32 text-center flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-4xl md:text-6xl font-medium text-[#111] mb-12 tracking-[-0.03em] leading-tight">
            Tell me about your next <br className="hidden md:block" /> project
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="mailto:sales@msengineering.com" className="bg-[#111] hover:bg-black text-white font-medium py-4 px-10 rounded-full transition-transform hover:-translate-y-0.5 text-sm flex items-center justify-center">
              Email Me
            </a>
            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="bg-white border border-gray-200 hover:border-gray-300 text-[#111] font-medium py-4 px-10 rounded-full transition-transform hover:-translate-y-0.5 text-sm flex items-center justify-center">
              WhatsApp
            </a>
          </div>
        </section>

        {/* MAP SECTION */}
        <section className="bg-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden h-[400px] md:h-[500px] relative p-3">
          <div className="w-full h-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden relative border border-gray-100">
            <iframe 
              src="https://maps.google.com/maps?q=MS+Engineering,+27-32-51,+75+Feet+Rd,+Visakhapatnam,+Andhra+Pradesh+530001&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'grayscale(0.5) contrast(1.05)' }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-gray-400">
          <p>2024 All rights reserved. MS Engineering.</p>
          <div className="flex gap-6 uppercase tracking-widest text-[10px]">
             <Link href="#" className="hover:text-gray-900 transition-colors">LinkedIn</Link>
             <Link href="#" className="hover:text-gray-900 transition-colors">Dribbble</Link>
             <Link href="#" className="hover:text-gray-900 transition-colors">Instagram</Link>
          </div>
        </footer>

      </main>
    </div>
  );
}
