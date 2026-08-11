"use client";

import React from 'react';
import { Activity, Car, ShieldAlert, CheckCircle2, AlertTriangle, LayoutGrid, List, Camera } from 'lucide-react';

export default function LiveActivityFeed({
  isLoadingData,
  activeFleet,
  fraudAlerts,
  pmsAlerts,
  processedFleet,
  viewMode,
  setViewMode,
  setSelectedDriver,
  setPmsModal
}) {
  if (!isLoadingData && activeFleet.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl shadow-sm">
        <div className="w-24 h-24 bg-cyan-950/40 border border-cyan-900/50 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <Activity className="w-10 h-10 text-cyan-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-100 mb-3 tracking-tight">Dashboard Empty</h3>
        <p className="text-slate-400 max-w-md text-sm mb-10 leading-relaxed font-mono">
          You haven't assigned any drivers or vehicles yet. Register your first vehicle and add a driver to start monitoring your fleet.
        </p>
      </div>
    );
  }

  const handleInvestigateClick = (e, anomalyData) => {
    e.preventDefault();
    const rootDriver = processedFleet.find(d => String(d.telegram_id) === String(anomalyData.driver_id)) || anomalyData;
    setSelectedDriver(rootDriver);
  };

  const handleCardClick = (e, driver) => {
    e.preventDefault();
    setSelectedDriver(driver);
  };

  return (
    <div className="space-y-10">
      {isLoadingData ? (
        <div className="flex items-center justify-center p-16 text-slate-600"><Activity className="w-8 h-8 animate-pulse" /></div>
      ) : (
        <>
          <div className="space-y-4">
            <h3 className="font-bold text-slate-500 text-[10px] uppercase tracking-widest">Live Fleet Status</h3>

            {fraudAlerts.length > 0 && (
              <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl overflow-hidden shadow-2xl mb-6 animate-in slide-in-from-top-4">
                <div className="bg-rose-950/60 p-5 border-b border-rose-900/50 flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
                  <h3 className="font-bold text-rose-500 uppercase tracking-widest text-sm">Action Required: {fraudAlerts.length} Suspected Fuel Loss Warning{fraudAlerts.length > 1 ? 's' : ''}</h3>
                </div>
                <div className="divide-y divide-rose-900/30">
                  {fraudAlerts.map(anomaly => (
                    <div key={`fraud-${anomaly.id}`} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-rose-950/20 hover:bg-rose-900/20 transition-colors">
                      <div className="flex-1 cursor-pointer" onClick={(e) => handleInvestigateClick(e, anomaly)}>
                        <p className="font-bold text-rose-400 font-mono text-xl">{anomaly.vehicle_specs?.model_name || 'Unassigned Vehicle'}</p>
                        <div className="flex flex-col gap-1 mt-2">
                          <div className="flex items-center gap-2 text-xs text-rose-500/80 uppercase tracking-widest">
                             <span className="text-slate-500">Driver:</span> <span className="font-bold text-slate-300">{anomaly.driver_name}</span> 
                             <span className="mx-2">•</span> 
                             <span className="font-bold text-rose-400">Efficiency Dropped {anomaly.efficiencyDrop?.toFixed(0)}%</span>
                             <span className="mx-2">•</span> 
                             <span className="font-bold text-rose-500">Est. Loss: ₱{Number(anomaly.estimatedLoss || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{anomaly.alertReason}</span>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => handleInvestigateClick(e, anomaly)} 
                        className="px-5 py-3 bg-rose-900/50 hover:bg-rose-800/80 text-rose-200 text-xs font-bold uppercase tracking-widest rounded border border-rose-800 transition-colors"
                      >
                        Investigate
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pmsAlerts.length === 0 && fraudAlerts.length === 0 ? (
              <div className="bg-emerald-950/20 border border-emerald-900/30 p-8 rounded-xl flex items-center gap-5 shadow-lg">
                <div className="p-4 bg-emerald-900/40 rounded-lg text-emerald-400"><CheckCircle2 className="w-8 h-8" /></div>
                <div>
                  <p className="font-bold text-emerald-400 tracking-wide text-xl">All Vehicles Nominal</p>
                  <p className="text-sm text-emerald-600/80 font-mono mt-2">No suspicious fuel drops or urgent maintenance requirements detected.</p>
                </div>
              </div>
            ) : pmsAlerts.length > 0 && (
              <div className="bg-amber-950/10 border border-amber-900/50 rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-amber-950/40 p-5 border-b border-amber-900/50 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-amber-500 uppercase tracking-widest text-sm">PMS Due: {pmsAlerts.length} Vehicle{pmsAlerts.length > 1 ? 's' : ''}</h3>
                </div>
                <div className="divide-y divide-amber-900/30">
                  {pmsAlerts.map(driver => (
                    <div key={driver.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-amber-950/20 hover:bg-amber-900/20 transition-colors">
                      <div className="flex-1 cursor-pointer" onClick={(e) => handleCardClick(e, driver)}>
                        <p className="font-bold text-amber-400 font-mono text-xl">{driver.vehicle_specs?.model_name || 'Unassigned Vehicle'}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-amber-500/80 uppercase tracking-widest">
                           <span className="text-slate-500">Driver:</span> <span className="font-bold">{driver.driver_name}</span> 
                           <span className="mx-2">•</span> 
                           <span className="text-slate-500">Odometer:</span> <span className="font-bold">{driver.latestOdo?.toLocaleString() || 0} km</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          type="button"
                          onClick={(e) => handleCardClick(e, driver)} 
                          className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-widest rounded border border-slate-700 transition-colors"
                        >
                          View Details
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => { e.preventDefault(); setPmsModal({ open: true, driver: driver, latestOdo: driver.latestOdo }); }} 
                          className="px-5 py-3 bg-amber-900/50 hover:bg-amber-800/80 text-amber-200 text-xs font-bold uppercase tracking-widest rounded border border-amber-800 transition-colors flex items-center gap-2"
                        >
                          <Camera className="w-4 h-4" /> Save Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end pb-2">
              <h3 className="font-bold text-slate-500 text-[10px] uppercase tracking-widest">Live Driver Activity</h3>
              <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
                <button type="button" onClick={(e) => { e.preventDefault(); setViewMode('grid'); }} className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-cyan-900/50 text-cyan-400 shadow' : 'text-slate-500 hover:text-slate-300'}`}><LayoutGrid className="w-4 h-4" /></button>
                <button type="button" onClick={(e) => { e.preventDefault(); setViewMode('list'); }} className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-cyan-900/50 text-cyan-400 shadow' : 'text-slate-500 hover:text-slate-300'}`}><List className="w-4 h-4" /></button>
              </div>
            </div>

            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                {processedFleet.map(driver => {
                  const v = driver.vehicle_specs || {};
                  const latestOdo = driver.latestOdo || 0;
                  const nextPms = v.next_pms || (latestOdo + 10000);
                  const distanceToPms = nextPms - latestOdo;
                  const isHealthy = distanceToPms > 1000 && !driver.isFraudulent;
                  
                  // HEALTH BAR MATH
                  const healthPercent = Math.max(0, Math.min(100, (distanceToPms / 10000) * 100));
                  let healthColor = 'bg-emerald-500';
                  let textColor = 'text-emerald-400';
                  if (healthPercent < 10) { healthColor = 'bg-rose-500'; textColor = 'text-rose-400'; }
                  else if (healthPercent < 30) { healthColor = 'bg-amber-500'; textColor = 'text-amber-400'; }

                  return (
                    <div 
                      key={driver.id} 
                      onClick={(e) => handleCardClick(e, driver)} 
                      className={`bg-slate-900 p-6 rounded-xl border transition-all relative overflow-hidden shadow-lg cursor-pointer flex flex-col justify-between ${driver.isFraudulent ? 'border-rose-900/50 shadow-rose-900/10 hover:border-rose-500' : 'border-slate-800 hover:border-cyan-800'}`}
                    >
                      <div className={`absolute top-0 left-0 w-full h-1 transition-colors ${driver.isFraudulent ? 'bg-rose-500' : 'bg-slate-800 group-hover:bg-cyan-500'}`}></div>
                      
                      <div>
                        <div className="flex justify-between items-start mb-6 pt-2">
                          <div>
                            <h4 className="font-bold text-slate-100 text-lg">{driver.driver_name}</h4>
                            <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest">ID: {driver.telegram_id}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${driver.isFraudulent ? 'bg-rose-950/80 text-rose-400 border border-rose-900 animate-pulse' : isHealthy ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50' : 'bg-amber-950/50 text-amber-400 border border-amber-900/50'}`}>
                            {driver.isFraudulent ? 'Fuel Drop' : isHealthy ? 'Nominal' : 'PMS Due'}
                          </span>
                        </div>

                        <div className="bg-slate-950 p-4 rounded border border-slate-800/50 mb-4">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Assigned Vehicle</p>
                          <p className="text-base font-semibold text-slate-200 truncate">{v.model_name || 'Unassigned Vehicle'}</p>
                        </div>
                        
                        <div className="flex justify-between items-baseline mb-4">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Odometer</span>
                          <span className="font-bold text-cyan-400 font-mono text-lg">{latestOdo.toLocaleString()} <span className="text-slate-600 text-xs">km</span></span>
                        </div>
                      </div>

                      {/* NEW PMS HEALTH BAR */}
                      <div className="mt-2 space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                          <span className="text-slate-500">PMS Health</span>
                          <span className={textColor}>
                            {distanceToPms > 0 ? `${distanceToPms.toLocaleString()} km left` : 'OVERDUE'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800 overflow-hidden">
                          <div 
                            className={`h-full ${healthColor} transition-all duration-1000`} 
                            style={{ width: `${healthPercent}%` }}
                          ></div>
                        </div>
                      </div>

                    </div>
                  )
                })}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg animate-in fade-in duration-300">
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-slate-950 border-b border-slate-800 text-xs uppercase tracking-widest text-slate-500 font-medium">
                      <tr>
                        <th className="px-8 py-5">Driver & Vehicle</th>
                        <th className="px-8 py-5">Current Odometer</th>
                        <th className="px-8 py-5">PMS Health</th>
                        <th className="px-8 py-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {processedFleet.map(driver => {
                        const v = driver.vehicle_specs || {};
                        const latestOdo = driver.latestOdo || 0;
                        const nextPms = v.next_pms || (latestOdo + 10000);
                        const distanceToPms = nextPms - latestOdo;
                        const isHealthy = distanceToPms > 1000 && !driver.isFraudulent;

                        const healthPercent = Math.max(0, Math.min(100, (distanceToPms / 10000) * 100));
                        let healthColor = 'bg-emerald-500';
                        let textColor = 'text-emerald-400';
                        if (healthPercent < 10) { healthColor = 'bg-rose-500'; textColor = 'text-rose-400'; }
                        else if (healthPercent < 30) { healthColor = 'bg-amber-500'; textColor = 'text-amber-400'; }

                        return (
                          <tr 
                            key={driver.id} 
                            onClick={(e) => handleCardClick(e, driver)}
                            className={`transition-colors group cursor-pointer ${driver.isFraudulent ? 'hover:bg-rose-950/20' : 'hover:bg-slate-800/30'}`}
                          >
                            <td className="px-8 py-5">
                              <p className="font-bold text-slate-100 text-sm">{driver.driver_name}</p>
                              <p className="text-xs text-cyan-500/80 font-mono mt-1">{v.model_name || 'Unassigned Vehicle'}</p>
                            </td>
                            <td className="px-8 py-5 font-mono text-slate-300 text-sm">
                              {latestOdo.toLocaleString()} <span className="text-slate-600 text-xs">km</span>
                            </td>
                            <td className="px-8 py-5 min-w-[200px]">
                               {/* NEW PMS HEALTH BAR (LIST VIEW) */}
                               <div className="space-y-1.5 w-full">
                                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                                    <span className={textColor}>
                                      {distanceToPms > 0 ? `${distanceToPms.toLocaleString()} km left` : 'OVERDUE'}
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800 overflow-hidden">
                                    <div className={`h-full ${healthColor} transition-all duration-1000`} style={{ width: `${healthPercent}%` }}></div>
                                  </div>
                                </div>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <span className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider ${driver.isFraudulent ? 'bg-rose-950/80 text-rose-400 animate-pulse border border-rose-900' : isHealthy ? 'bg-emerald-950/30 text-emerald-500' : 'bg-amber-950/50 text-amber-400 border border-amber-900/50'}`}>
                                {driver.isFraudulent ? 'Fuel Drop' : isHealthy ? 'Nominal' : 'PMS Due'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}