"use client";

import React from 'react';
import { X, Wrench, Calendar, Receipt } from 'lucide-react';

export default function MaintenanceLedgerModal({
  driver,
  maintenanceLogs = [],
  onClose
}) {
  if (!driver) return null;

  const v = driver.vehicle_specs || {};
  
  // STRICT SAFETY: Ensure we have an array to filter
  const safeLogs = Array.isArray(maintenanceLogs) ? maintenanceLogs : [];
  
  const vehicleLogs = safeLogs
    .filter(log => log.vehicle_id === v.id)
    .sort((a, b) => new Date(b.service_date || b.created_at) - new Date(a.service_date || a.created_at));

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5),_0_0_0_1px_rgba(255,255,255,0.05)] w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
              <Wrench className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg leading-tight">Itemized Maintenance Ledger</h3>
              <p className="text-sm text-cyan-400 font-mono mt-0.5">{v.model_name || 'Unassigned Vehicle'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-8 bg-slate-950/50">
          <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/50">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-500 text-[10px] uppercase tracking-widest font-bold border-b border-slate-800/80">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Service Details</th>
                  <th className="px-6 py-4">Odometer</th>
                  <th className="px-6 py-4 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {vehicleLogs.map((log) => {
                  // PROPER DATA MAPPING: Aligned with Supabase schema naming conventions
                  const logDate = log.service_date || log.created_at;
                  const displayDate = logDate ? new Date(logDate).toLocaleDateString() : 'N/A';
                  const cost = Number(log.total_cost || log.cost || 0);
                  const odo = log.odometer_at_service || log.odometer || 0;
                  
                  // Graceful fallbacks for text descriptions
                  const title = log.service_type || log.repair_type || log.title || 'General Maintenance';
                  const details = log.service_notes || log.description || log.details || 'No additional details';

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-400 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {displayDate}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-200">{title}</p>
                        <p className="text-xs text-slate-500 mt-1">{details}</p>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        {odo.toLocaleString()} km
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-200 font-mono">
                          ₱{cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {vehicleLogs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-slate-500">
                      <Receipt className="w-10 h-10 mx-auto mb-4 opacity-20" />
                      <p className="text-sm font-mono">No maintenance records found for this unit.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}