"use client";

import React from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, Cpu, Globe, Crosshair } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden flex flex-col">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
                    <defs>
                        <filter id="glowSentinel" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1" />
                            <feMerge>
                                <feMergeNode in="blur1" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <linearGradient id="gradSentinel" x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#0891b2" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#020617" stopOpacity="0.9" />
                        </linearGradient>
                    </defs>
                    <path d="M 32 10 C 50 10 60 32 60 32 C 60 32 50 54 32 54 C 14 54 4 32 4 32 C 4 32 14 10 32 10 Z" fill="url(#gradSentinel)" stroke="#22d3ee" strokeWidth="2.5" strokeLinejoin="round" filter="url(#glowSentinel)"/>
                    <circle cx="32" cy="32" r="10" stroke="#06b6d4" strokeWidth="2.5" filter="url(#glowSentinel)"/>
                    <circle cx="32" cy="32" r="3.5" fill="#ffffff" filter="url(#glowSentinel)"/>
                    <path d="M 32 18 V 22 M 32 42 V 46 M 18 32 H 22 M 42 32 H 46" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-wide text-white">
                Sentinel<span className="text-cyan-400 font-light">Fleet</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-slate-400">
              <Link href="/tutorial" className="hover:text-cyan-400 transition-colors">Tutorial</Link>
              <Link href="/about" className="text-cyan-400 transition-colors">About</Link>
            </div>
          </div>
          <Link href="/" className="text-sm font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors">
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl mx-auto px-6 pt-36 pb-24 space-y-20">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-900/50 text-cyan-400 text-xs font-bold uppercase tracking-widest">
            <Activity className="w-3.5 h-3.5" /> Corporate Identity
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Sentinel Soft Solutions</h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Engineering uncompromising enterprise software designed to eradicate logistical friction and safeguard operational capital.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-900/10 blur-[80px] rounded-full pointer-events-none"></div>
          
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <Crosshair className="w-6 h-6 text-cyan-400" /> The Directive
          </h2>
          <p className="text-slate-400 leading-relaxed mb-6">
            Logistics and transportation networks bleed millions annually due to undetected fuel siphoning, disorganized paper trails, and missed preventative maintenance schedules. Existing tools are clunky, requiring drivers to download complex applications they refuse to use. 
          </p>
          <p className="text-slate-400 leading-relaxed">
            Sentinel Soft Solutions was founded to bridge the gap between high-end enterprise analytics and boots-on-the-ground operational reality. By integrating directly into platforms drivers already use—like Telegram—we remove friction while delivering mathematical certainty and strict ledger compliance to fleet operators. 
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl">
            <div className="w-10 h-10 bg-emerald-950/50 rounded-lg flex items-center justify-center mb-4 border border-emerald-900/50">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Uncompromising Audits</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We replace guesswork with data. Our AI models establish baseline efficiency limits and strictly monitor every logged transaction, ensuring maximum financial protection.
            </p>
          </div>
          
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl">
            <div className="w-10 h-10 bg-cyan-950/50 rounded-lg flex items-center justify-center mb-4 border border-cyan-900/50">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Frictionless Architecture</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Software is only effective if your team actually uses it. Sentinel is designed to disappear into the background, utilizing automated bots and OCR (Optical Character Recognition).
            </p>
          </div>
        </div>

        {/* Headquarters */}
        <div className="text-center pt-10 border-t border-slate-800">
          <div className="flex justify-center mb-4">
            <Globe className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-white font-bold text-lg">Base of Operations</h3>
          <p className="text-slate-400 mt-2">Tacloban City, Eastern Visayas, Philippines</p>
          <p className="text-slate-500 text-sm mt-4 italic">Built for operators, by operators.</p>
        </div>

      </div>

      {/* Corporate Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-950 py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 items-center">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center grayscale opacity-40">
              <ShieldCheck className="w-6 h-6 text-slate-500" />
            </div>
            <span className="text-slate-500 text-sm font-bold tracking-wide">
              Sentinel<span className="font-light">Fleet</span>
            </span>
          </div>
          <div className="text-center text-slate-500 text-sm space-y-1.5 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-widest text-slate-600 font-bold mb-1">Contact & Support</p>
            <p>Email: <a href="mailto:rozenpasque@gmail.com" className="hover:text-cyan-400 transition-colors">rozenpasque@gmail.com</a></p>
          </div>
          <div className="text-center md:text-right text-slate-500 text-sm space-y-1.5 flex flex-col justify-center">
            <p>&copy; 2026 <strong className="text-slate-400">Sentinel Soft Solutions</strong></p>
            <p className="text-xs text-slate-600 uppercase tracking-widest font-mono">Tacloban City, Philippines</p>
          </div>
        </div>
      </footer>
    </div>
  );
}