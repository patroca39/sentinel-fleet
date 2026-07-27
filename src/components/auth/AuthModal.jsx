"use client";

import React from 'react';
import { X, Activity, Building, Users, Mail, Lock, Loader2 } from 'lucide-react';

export default function AuthModal({
  authMode,
  setAuthMode,
  setShowLoginModal,
  isProcessingAuth,
  authForm,
  setAuthForm,
  handleAuthSubmit
}) {
  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={() => setShowLoginModal(false)}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8 pb-4 text-center border-b border-slate-800">
          <div className="w-14 h-14 bg-cyan-900/30 border border-cyan-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">SentinelFleet Access</h2>
          <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">Fleet Owner Sign In</p>
          
          <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-lg mt-6">
            <button 
              onClick={(e) => { e.preventDefault(); setAuthMode('login'); }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded transition-colors ${authMode === 'login' ? 'bg-cyan-900/50 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Login
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); setAuthMode('enroll'); }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded transition-colors ${authMode === 'enroll' ? 'bg-cyan-900/50 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Register
            </button>
          </div>
        </div>

        <form onSubmit={handleAuthSubmit} className="p-8 space-y-5 max-h-[60vh] overflow-y-auto">
          {authMode === 'enroll' && (
            <>
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Company / TNVS Fleet Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input type="text" required={authMode === 'enroll'} value={authForm.companyName} onChange={e => setAuthForm({...authForm, companyName: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-cyan-500 text-slate-200 font-mono text-sm transition-colors" placeholder="e.g. RozenPasque Transport" />
                </div>
              </div>
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Owner Name</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input type="text" required={authMode === 'enroll'} value={authForm.contactPerson} onChange={e => setAuthForm({...authForm, contactPerson: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-cyan-500 text-slate-200 font-mono text-sm transition-colors" placeholder="e.g. Patrick Roca" />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input type="email" required value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-cyan-500 text-slate-200 font-mono text-sm transition-colors" placeholder="owner@fleet.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input type="password" required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-cyan-500 text-slate-200 font-mono text-sm transition-colors" placeholder="••••••••" />
            </div>
          </div>
          
          <div className="pt-2">
            <button type="submit" disabled={isProcessingAuth} className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-3.5 rounded-lg transition-all flex justify-center items-center gap-2 shadow-lg shadow-cyan-900/20">
              {isProcessingAuth ? <Loader2 className="w-5 h-5 animate-spin" /> : (authMode === 'login' ? 'Secure Sign In' : 'Create Fleet Account')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}