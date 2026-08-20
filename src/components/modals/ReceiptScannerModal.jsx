"use client";

import React, { useState } from 'react';
import { X, Receipt, Save, Loader2, Calendar, User, Activity, Droplets, CircleDollarSign } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';

export default function ReceiptScannerModal({ log, session, onClose }) {
  const [isSaving, setIsSaving] = useState(false);
  
  // STRICT SAFETY: Initialize editable state with the log's current values
  const [formData, setFormData] = useState({
    cost: log?.cost || 0,
    fuel_liters: log?.fuel_liters || 0,
    odometer: log?.odometer || 0,
  });

  if (!log) return null;

  const rawDate = log.created_at || log.date;
  const displayDate = rawDate ? format(new Date(rawDate), 'MMMM dd, yyyy - hh:mm a') : 'N/A';
  const driverName = log.driver_name || log.driver_id || 'Unknown Driver';

  // Handle local state changes as the user types
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Execute the database update
  const handleSave = async () => {
    setIsSaving(true);
    const supabase = createClient();
    
    try {
      const operatorId = session?.user?.id;
      
      let query = supabase
        .from('logs')
        .update({
          cost: Number(formData.cost),
          fuel_liters: Number(formData.fuel_liters),
          odometer: Number(formData.odometer)
        })
        .eq('id', log.id);

      if (operatorId) {
        query = query.eq('operator_id', operatorId);
      }

      const { error } = await query;

      if (error) throw error;
      
      // Force a page reload to instantly sync the UI with the newly saved database values
      window.location.reload();
    } catch (error) {
      console.error("Save Error:", error);
      alert(`Failed to save receipt: ${error.message}`);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5),_0_0_0_1px_rgba(255,255,255,0.05)] w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <Receipt className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg leading-tight">Edit Fuel Receipt</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Log ID: {log.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Date</p>
              <p className="text-xs font-semibold text-slate-300">{displayDate}</p>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5"><User className="w-3 h-3"/> Driver</p>
              <p className="text-xs font-semibold text-slate-300 truncate" title={driverName}>{driverName}</p>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <CircleDollarSign className="w-4 h-4 text-emerald-500"/> Total Cost (₱)
              </label>
              <input 
                type="number" 
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-cyan-500"/> Fuel Volume (Liters)
              </label>
              <input 
                type="number" 
                name="fuel_liters"
                value={formData.fuel_liters}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-amber-500"/> Odometer (km)
              </label>
              <input 
                type="number" 
                name="odometer"
                value={formData.odometer}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg text-sm font-bold tracking-wider uppercase text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-5 py-2 rounded-lg text-sm font-bold tracking-wider uppercase transition-colors shadow-[0_0_15px_rgba(217,119,6,0.2)]"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving...' : 'Save Receipt'}
          </button>
        </div>

      </div>
    </div>
  );
}