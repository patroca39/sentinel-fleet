"use client";

import React, { useState } from 'react';
import { Wrench, MapPin, Eye, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function RepairLedger({ 
  maintenanceHistory = [], 
  isLoadingData = false,
  setSelectedLog 
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // STRICT SAFETY: Ensure we always have an array
  const safeLogs = Array.isArray(maintenanceHistory) ? maintenanceHistory : [];

  // Filter logs based on search input (vehicle name or shop location)
  const filteredLogs = safeLogs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    const vehicleName = log.vehicle_specs?.model_name || log.vehicle_name || '';
    const shop = log.shop_location || '';
    return vehicleName.toLowerCase().includes(searchLower) || 
           shop.toLowerCase().includes(searchLower);
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col min-h-[600px] overflow-hidden">
      
      {/* Header & Controls */}
      <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/50">
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
          <Wrench className="w-4 h-4 text-slate-400" /> 
          Historical Repair Ledger
        </h2>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search vehicle or shop..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:border-cyan-500 outline-none w-full sm:w-64 transition-colors"
            />
          </div>
          <button className="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg text-slate-400 hover:text-slate-200 transition-colors border border-slate-700">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm text-slate-400 whitespace-nowrap">
          <thead className="bg-slate-950/80 text-slate-500 text-[10px] uppercase tracking-widest font-bold border-b border-slate-800 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4">Total Cost</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Vehicle</th>
              <th className="px-6 py-4">Shop Location</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {isLoadingData ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-mono text-xs uppercase tracking-widest">Loading Ledger Data...</p>
                  </div>
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                  <p className="font-mono text-sm">No maintenance records found.</p>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const cost = Number(log.total_cost || log.cost || 0);
                const logDate = log.service_date || log.created_at;
                let displayDate = 'N/A';
                if (logDate) {
                  try { displayDate = format(new Date(logDate), 'yyyy-MM-dd'); } catch(e) {}
                }
                const vehicleName = log.vehicle_specs?.model_name || log.vehicle_name || 'Unassigned Vehicle';
                const shop = log.shop_location || 'Location Not Logged';

                return (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-black text-emerald-400 font-mono text-sm tracking-wider">
                        ₱{cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300 text-xs">
                      {displayDate}
                    </td>
                    <td className="px-6 py-4 text-cyan-400 font-mono text-xs">
                      {vehicleName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        {shop !== 'Location Not Logged' && <MapPin className="w-3.5 h-3.5 text-slate-500" />}
                        <span className={shop === 'Location Not Logged' ? 'text-slate-600 italic text-xs' : 'text-xs font-semibold uppercase tracking-wider'}>
                          {shop}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="opacity-0 group-hover:opacity-100 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-900/50 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}