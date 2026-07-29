"use client";

import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="absolute top-0 w-full z-50 px-6 py-6 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 flex items-center justify-center grayscale opacity-70 group-hover:opacity-100 group-hover:grayscale-0 transition-all">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
                <path d="M 32 10 C 50 10 60 32 60 32 C 60 32 50 54 32 54 C 14 54 4 32 4 32 C 4 32 14 10 32 10 Z" fill="#020617" stroke="#06b6d4" strokeWidth="2.5" strokeLinejoin="round"/>
                <circle cx="32" cy="32" r="10" stroke="#06b6d4" strokeWidth="2.5"/>
                <circle cx="32" cy="32" r="3.5" fill="#06b6d4"/>
                <path d="M 32 18 V 22 M 32 42 V 46 M 18 32 H 22 M 42 32 H 46" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-slate-300 text-lg font-bold tracking-wide group-hover:text-white transition-colors">
            Sentinel<span className="font-light">Fleet</span>
          </span>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {/* Replaced old onClick modal trigger with direct routing */}
          <Link 
            href="/login"
            className="text-xs sm:text-sm font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors px-4 py-2 rounded-lg hover:bg-slate-800/50"
          >
            Command Center Login
          </Link>
        </div>

      </div>
    </nav>
  );
}