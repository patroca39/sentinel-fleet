"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Navbar({ setAuthMode, setShowLoginModal }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Left side: Logo & Navigation Links (Spaced out to fix cramping) */}
        <div className="flex items-center gap-12 sm:gap-16"> 
          
          {/* Logo (This acts as the Back to Home link) */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-transform group-hover:scale-105">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
                  <defs>
                      <filter id="glowSentinelNav" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1" />
                          <feMerge>
                              <feMergeNode in="blur1" />
                              <feMergeNode in="SourceGraphic" />
                          </feMerge>
                      </filter>
                      <linearGradient id="gradSentinelNav" x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#0891b2" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#020617" stopOpacity="0.9" />
                      </linearGradient>
                  </defs>
                  <path d="M 32 10 C 50 10 60 32 60 32 C 60 32 50 54 32 54 C 14 54 4 32 4 32 C 4 32 14 10 32 10 Z" fill="url(#gradSentinelNav)" stroke="#22d3ee" strokeWidth="2.5" strokeLinejoin="round" filter="url(#glowSentinelNav)"/>
                  <circle cx="32" cy="32" r="10" stroke="#06b6d4" strokeWidth="2.5" filter="url(#glowSentinelNav)"/>
                  <circle cx="32" cy="32" r="3.5" fill="#ffffff" filter="url(#glowSentinelNav)"/>
                  <path d="M 32 18 V 22 M 32 42 V 46 M 18 32 H 22 M 42 32 H 46" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-wide text-white transition-colors group-hover:text-cyan-400">
              Sentinel<span className="text-cyan-400 font-light group-hover:text-white">Fleet</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-400">
            <Link href="/tutorial" className="hover:text-cyan-400 transition-colors">Tutorial</Link>
            <Link href="/about" className="hover:text-cyan-400 transition-colors">About</Link>
          </div>
        </div>

        {/* Right side: Login & Mobile Toggle */}
        <div className="flex items-center gap-4">
          {setShowLoginModal && (
            <button 
              onClick={() => { setAuthMode('login'); setShowLoginModal(true); }}
              className="hidden sm:block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
            >
              Command Center Login
            </button>
          )}
          
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-900 border-b border-slate-800 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex flex-col p-4 space-y-4">
            <Link href="/tutorial" className="text-sm font-bold uppercase tracking-widest text-slate-300 hover:text-cyan-400 p-2 border-b border-slate-800">Tutorial</Link>
            <Link href="/about" className="text-sm font-bold uppercase tracking-widest text-slate-300 hover:text-cyan-400 p-2 border-b border-slate-800">About</Link>
            {setShowLoginModal && (
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setAuthMode('login'); setShowLoginModal(true); }}
                className="text-sm font-bold uppercase tracking-widest text-cyan-400 p-2 text-left"
              >
                Command Center Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}