"use client";

import React from 'react';
import { Menu } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setIsMobileMenuOpen, 
  subscriptionTier 
}) {
  
  // This must remain INSIDE the component so it can read the activeTab prop
  const getTabTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Live Fleet Activity';
      case 'cpk': return 'Cost-Per-Kilometer (CPK) Analytics';
      case 'fuel': return 'Fuel Analytics & Pump Prices';
      case 'assets': return 'Vehicle Registry';
      case 'onboarding': return 'Driver Registry';
      case 'maintenance': return 'Lifetime Repair Ledger';
      default: return 'Fleet Dashboard';
    }
  };

  return (
    <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-8 py-5 flex justify-between items-center z-10 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden text-slate-400 hover:text-slate-200 transition-colors" 
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-slate-100 capitalize tracking-wide">
          {getTabTitle()}
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm hidden sm:inline-block ${subscriptionTier === 'PRO' ? 'bg-cyan-950/50 text-cyan-400 border border-cyan-900/50' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
          {subscriptionTier === 'PRO' ? 'Pro Tier' : 'Free Trial'}
        </span>
        
        <div className="flex items-center gap-3 bg-emerald-950/30 border border-emerald-900/30 px-3 py-1.5 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase font-mono hidden sm:inline-block">
            System Nominal
          </span>
        </div>
      </div>
    </header>
  );
}