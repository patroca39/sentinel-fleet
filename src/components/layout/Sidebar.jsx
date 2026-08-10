"use client";

import React from 'react';
import { Activity, Fuel, Car, UserPlus, Wrench, CircleDollarSign, LogOut } from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  handleLogout 
}) {
  
  // This array sits safely inside the component
  const navItems = [
    { id: 'dashboard', icon: Activity, label: 'Live Activity' },
    { id: 'cpk', icon: CircleDollarSign, label: 'CPK Analytics' },
    { id: 'fuel', icon: Fuel, label: 'Fuel Metrics' },
    { id: 'assets', icon: Car, label: 'Manage Vehicles' },
    { id: 'onboarding', icon: UserPlus, label: 'Manage Drivers' },
    { id: 'maintenance', icon: Wrench, label: 'Repair Ledger' }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 z-30 md:hidden backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Brand Header */}
        <div className="p-8 border-b border-slate-800">
          <h1 className="text-slate-100 font-bold text-2xl flex items-center gap-3 tracking-tight">
            <svg width="30" height="30" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 overflow-visible">
                <defs>
                    <filter id="glowSentinelSidebar" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1" />
                        <feMerge>
                            <feMergeNode in="blur1" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <linearGradient id="gradSentinelSidebar" x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#0891b2" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#020617" stopOpacity="0.9" />
                    </linearGradient>
                </defs>
                <path d="M 32 10 C 50 10 60 32 60 32 C 60 32 50 54 32 54 C 14 54 4 32 4 32 C 4 32 14 10 32 10 Z" fill="url(#gradSentinelSidebar)" stroke="#22d3ee" strokeWidth="2.5" strokeLinejoin="round" filter="url(#glowSentinelSidebar)"/>
                <circle cx="32" cy="32" r="10" stroke="#06b6d4" strokeWidth="2.5" filter="url(#glowSentinelSidebar)"/>
                <circle cx="32" cy="32" r="3.5" fill="#ffffff" filter="url(#glowSentinelSidebar)"/>
                <path d="M 32 18 V 22 M 32 42 V 46 M 18 32 H 22 M 42 32 H 46" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Sentinel<span className="font-light text-cyan-400">Fleet</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-mono mt-2 uppercase tracking-widest">Command Center</p>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 p-6 space-y-2">
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => {
                setActiveTab(item.id); 
                setIsMobileMenuOpen(false);
              }} 
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-900/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </nav>
        
        {/* Footer / Logout */}
        <div className="p-6 border-t border-slate-800">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-950/30 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
           </button>
        </div>
      </div>
    </>
  );
}