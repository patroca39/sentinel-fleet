"use client";

import React from 'react';
import { ShieldAlert, X } from 'lucide-react';

export default function RevokeDriverModal({ 
  revokeModal, 
  setRevokeModal, 
  executeRevoke 
}) {
  if (!revokeModal.open) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-rose-900/50 rounded-xl shadow-[0_20px_50px_rgba(225,29,72,0.15)] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-rose-950/20">
          <h3 className="font-bold text-rose-500 text-sm uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert className="w-4 h-4"/> Release Driver
          </h3>
          <button 
            onClick={() => setRevokeModal({ open: false, driver: null, reason: 'Resigned (Voluntary)' })} 
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div>
            <p className="text-slate-300 text-sm mb-1">Target Driver: <span className="font-bold">{revokeModal.driver?.driver_name}</span></p>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">App ID: {revokeModal.driver?.telegram_id}</p>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reason for Releasing</label>
            <select 
              value={revokeModal.reason}
              onChange={e => setRevokeModal({...revokeModal, reason: e.target.value})}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-lg focus:border-rose-500 font-mono text-sm outline-none text-slate-300 transition-colors"
            >
              <option value="Resigned (Voluntary)">Resigned (Voluntary)</option>
              <option value="Terminated - Volume Skimming / Fraud">Terminated - Fuel Theft / Fraud</option>
              <option value="Terminated - Misconduct / Performance">Terminated - Misconduct</option>
              <option value="End of Contract">End of Contract</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button 
            onClick={executeRevoke}
            className="w-full bg-rose-700 hover:bg-rose-600 text-slate-100 font-bold py-4 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-lg shadow-rose-900/20"
          >
            Confirm Release & Save Log
          </button>
        </div>
      </div>
    </div>
  );
}