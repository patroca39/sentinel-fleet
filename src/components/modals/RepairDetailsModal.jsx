"use client";

import React from 'react';
import { X, Wrench, MapPin, Calendar, Activity, Receipt, CircleDollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function RepairDetailsModal({ log, onClose }) {
  if (!log) return null;

  const v = log.vehicle_specs || {};
  const vehicleName = v.model_name || log.vehicle_name || 'Unassigned Vehicle';
  
  const rawDate = log.service_date || log.created_at;
  const displayDate = rawDate ? format(new Date(rawDate), 'MMMM dd, yyyy') : 'N/A';
  
  const shop = log.shop_location || 'Unknown Location';
  const notes = log.service_notes || log.description || log.details || 'No additional details provided.';
  const type = log.service_type || log.repair_type || log.title || 'General Maintenance';
  
  const totalCost = Number(log.total_cost || log.cost || 0);
  const odo = log.odometer_at_service || log.odometer || 0;

  // STRICT SAFETY: Safely parse the JSON breakdown, falling back to 0 if older logs lack it
  let breakdown = { parts: 0, labor: 0, consumables: 0 };
  if (log.cost_breakdown) {
    try {
      breakdown = typeof log.cost_breakdown === 'string' 
        ? JSON.parse(log.cost_breakdown) 
        : log.cost_breakdown;
    } catch (e) {
      console.error("Failed to parse cost breakdown:", e);
    }
  }

  const hasBreakdown = breakdown.parts > 0 || breakdown.labor > 0 || breakdown.consumables > 0;

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5),_0_0_0_1px_rgba(255,255,255,0.05)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-start bg-slate-950">
          <div className="flex gap-4">
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 h-fit">
              <Wrench className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-xl">{type}</h3>
              <p className="text-sm text-slate-400 font-mono mt-1">{vehicleName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Meta Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Date</p>
              <p className="text-sm font-semibold text-slate-300">{displayDate}</p>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1.5"><MapPin className="w-3 h-3"/> Shop Location</p>
              <p className="text-sm font-semibold text-slate-300 truncate" title={shop}>{shop}</p>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 col-span-2 md:col-span-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5 flex items-center gap-1.5"><Activity className="w-3 h-3"/> Odometer</p>
              <p className="text-sm font-mono text-slate-300">{odo.toLocaleString()} km</p>
            </div>
          </div>

          {/* Service Notes */}
          <div className="bg-slate-800/30 border border-slate-800 rounded-lg p-5">
             <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Technician Notes</p>
             <p className="text-sm text-slate-300 leading-relaxed">{notes}</p>
          </div>

          {/* Itemized Cost Breakdown */}
          <div>
            <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2"><Receipt className="w-4 h-4 text-cyan-500"/> Itemized Invoice</h4>
            <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
              <div className="p-4 space-y-3">
                
                {hasBreakdown ? (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Parts & Components</span>
                      <span className="font-mono text-slate-300">₱{Number(breakdown.parts).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Labor & Services</span>
                      <span className="font-mono text-slate-300">₱{Number(breakdown.labor).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Shop Consumables & Fluids</span>
                      <span className="font-mono text-slate-300">₱{Number(breakdown.consumables).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-slate-500 italic py-2">No detailed breakdown provided by the shop.</div>
                )}
                
              </div>
              <div className="bg-slate-900 border-t border-slate-800 p-4 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2"><CircleDollarSign className="w-4 h-4"/> Total Billed</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">₱{totalCost.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}