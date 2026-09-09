"use client";

import React from 'react';
import { Activity, Fuel, Car, UserPlus, Wrench, CircleDollarSign, LogOut, Shield } from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  handleLogout 
}) {
  
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

      {/* Floating Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col 
        transform transition-transform duration-300 ease-in-out
        md:fixed md:top-4 md:bottom-4 md:left-4 md:h-[calc(100vh-2rem)] md:translate-x-0 md:rounded-2xl md:border shadow-sm
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-slate-100 font-bold text-xl flex items-center gap-3 tracking-tighter">
            <Shield className="w-6 h-6 text-cyan-500" />
            Sentinel<span className="font-medium text-cyan-500">Fleet</span>
          </h1>
          <p className="text-[9px] text-slate-500 font-mono mt-1.5 uppercase tracking-widest">Command Center</p>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => {
                setActiveTab(item.id); 
                setIsMobileMenuOpen(false);
              }} 
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all tracking-tight ${activeTab === item.id ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm' : 'text-slate-400 border border-transparent hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </nav>
        
        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-950/30 transition-colors border border-transparent hover:border-rose-900/50 tracking-tight">
              <LogOut className="w-4 h-4" /> Sign Out
           </button>
        </div>
      </div>
    </>
  );
}