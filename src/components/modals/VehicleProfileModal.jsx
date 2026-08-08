"use client";

import React, { useState } from 'react';
import { X, Activity, ShieldAlert, BarChart3, Receipt, CheckCircle } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function VehicleProfileModal({
  driver,
  fuelLogs = [], 
  maintenanceHistory = [], 
  fraudAlerts = [], 
  onClose,
  onOpenMaintenanceLedger,
  onResolveAnomaly,
  onSelectRepairLog
}) {
  const [isResolving, setIsResolving] = useState(false);

  if (!driver) return null;

  // STRICT SAFETY: Guarantees the charts and tables will never crash on undefined data
  const safeFuelLogs = Array.isArray(fuelLogs) ? fuelLogs : [];
  const safeMaintenance = Array.isArray(maintenanceHistory) ? maintenanceHistory : [];
  const safeAlerts = Array.isArray(fraudAlerts) ? fraudAlerts : [];

  const v = driver.vehicle_specs || {};
  const driverId = driver.telegram_id || driver.driver_id || 'Unregistered';
  
  const dLogs = safeFuelLogs
    .filter(log => String(log.driver_id) === String(driverId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
  const mLogs = safeMaintenance.filter(log => log.vehicle_id === v.id);
  
  const chartData = dLogs.slice(0, 14).map((log, index, array) => {
    const rawDate = log.created_at || log.timestamp || log.date || null;
    let displayDate = `Log ${log.id}`;
    if (rawDate) { 
        try { displayDate = format(new Date(rawDate), 'MMM dd'); } catch (e) {} 
    }

    let efficiency = 0;
    if (index < array.length - 1) {
      const prevLog = array[index + 1];
      const distance = log.odometer - prevLog.odometer;
      if (distance > 0 && log.fuel_liters > 0) {
        efficiency = (distance / log.fuel_liters).toFixed(1);
      }
    }
    
    return {
      name: displayDate,
      liters: Number(log.fuel_liters) || 0,
      efficiency: Number(efficiency)
    };
  }).reverse(); 

  const activeAlert = safeAlerts.find(a => String(a.driver_id) === String(driverId));
  const isFraudulent = !!activeAlert || !!driver.efficiencyDrop;
  const efficiencyDrop = activeAlert?.efficiencyDrop || driver.efficiencyDrop || 0;
  const estimatedLoss = activeAlert?.estimatedLoss || driver.estimatedLoss || 0;

  const handleResolve = async () => {
    setIsResolving(true);
    if (onResolveAnomaly) await onResolveAnomaly(driverId);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5),_0_0_0_1px_rgba(255,255,255,0.05)] w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div>
            <h3 className="font-bold text-slate-100 flex items-center gap-2"><Activity className="w-5 h-5 text-cyan-400"/> Detailed Vehicle Activity</h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">Driver: {driver.driver_name || 'Unknown'} • App ID: {driverId}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8">
          
          {isFraudulent && (
            <div className="bg-rose-950/40 border border-rose-900/50 p-6 rounded-xl flex flex-col gap-4">
               <div className="flex items-start gap-4">
                 <ShieldAlert className="w-6 h-6 text-rose-500 mt-1 flex-shrink-0 animate-pulse" />
                 <div className="flex-1">
                    <h4 className="font-bold text-rose-500 text-lg uppercase tracking-wide">Warning: Fuel Loss Detected</h4>
                    <p className="text-sm text-rose-400/90 mt-1 font-mono">This vehicle's fuel efficiency dropped by <span className="font-black text-rose-400">{efficiencyDrop.toFixed(0)}%</span> vs its normal usage.</p>
                 </div>
                 <div className="text-right pl-4 border-l border-rose-900/50">
                    <p className="text-[10px] text-rose-500/80 uppercase font-bold tracking-widest">Est. Money Lost</p>
                    <p className="text-2xl font-black text-rose-400 font-mono mt-1">₱{estimatedLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                 </div>
               </div>
               
               <div className="flex justify-end pt-4 border-t border-rose-900/30">
                  <button 
                    onClick={handleResolve}
                    disabled={isResolving}
                    className="flex items-center gap-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-900/50 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isResolving ? 'Resolving...' : 'Acknowledge & Clear Alert'}
                  </button>
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/30 border border-slate-800 p-6 rounded-xl">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Assigned Vehicle</p>
              <p className="font-semibold text-slate-200 truncate">{v.model_name || 'Unassigned'}</p>
              <p className="text-xs text-slate-500 font-mono mt-1">{v.vehicleType || v.vehicle_type || 'N/A'} • {v.fuel_type || 'N/A'}</p>
            </div>
            <div className="bg-slate-800/30 border border-slate-800 p-6 rounded-xl">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Total Fuel Ups</p>
              <p className="text-3xl font-black text-cyan-400 font-mono">{dLogs.length}</p>
            </div>
            <div className="bg-slate-800/30 border border-slate-800 p-6 rounded-xl">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Total Repair Cost</p>
              <p className="text-3xl font-black text-emerald-400 font-mono">
                ₱{mLogs.reduce((acc, log) => acc + Number(log.total_cost || log.cost || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/50 p-6 rounded-xl">
            <h4 className="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-500"/> Fuel Use vs Efficiency (Last 14 Logs)</h4>
            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}L`} dx={-10} />
                    <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} km/L`} dx={10} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', fontSize: '12px', borderRadius: '8px', padding: '12px' }}
                      cursor={{ fill: '#1e293b' }}
                    />
                    <Bar yAxisId="left" dataKey="liters" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Volume Pumped (L)" />
                    <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#0f172a' }} name="Efficiency (km/L)" />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
                  <span className="text-sm font-mono">No driving data available for this unit yet.</span>
                  {driverId !== 'Unregistered' && dLogs.length === 0 && (
                    <span className="text-[10px] uppercase tracking-widest text-amber-500/80">
                      Register driver in "Manage Drivers" to load history
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl overflow-hidden">
             <div className="p-5 border-b border-slate-800/50 flex justify-between items-center">
               <h4 className="text-sm font-bold text-slate-300">Recent Repairs & PMS</h4>
               <button 
                 onClick={() => onOpenMaintenanceLedger && onOpenMaintenanceLedger(driver)} 
                 className="bg-cyan-950/30 hover:bg-cyan-900/50 text-cyan-400 border border-cyan-900/50 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
               >
                  <Receipt className="w-3 h-3"/> View Full Ledger
               </button>
             </div>
             <table className="w-full text-left text-sm text-slate-400 whitespace-nowrap font-mono">
               <thead className="bg-slate-900/50 text-slate-500 border-b border-slate-800/50">
                 <tr><th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Date</th><th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Odometer</th><th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Cost</th></tr>
               </thead>
               <tbody className="divide-y divide-slate-800/50">
                 {mLogs.slice(0, 5).map(log => (
                   <tr 
                     key={log.id} 
                     onClick={() => onSelectRepairLog && onSelectRepairLog(log)}
                     className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                   >
                     <td className="px-6 py-4 text-slate-300 group-hover:text-cyan-400 transition-colors">{log.service_date || (log.created_at ? new Date(log.created_at).toLocaleDateString() : 'N/A')}</td>
                     <td className="px-6 py-4">{log.odometer_at_service?.toLocaleString() || log.odometer?.toLocaleString() || 0} km</td>
                     <td className="px-6 py-4 text-right font-bold text-emerald-400">₱{Number(log.total_cost || log.cost || 0).toLocaleString()}</td>
                   </tr>
                 ))}
                 {mLogs.length === 0 && <tr><td colSpan="3" className="text-center py-8 text-slate-600">No maintenance records logged.</td></tr>}
               </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
}