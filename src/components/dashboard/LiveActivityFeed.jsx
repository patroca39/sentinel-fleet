"use client";

import React from 'react';
import { Activity, Car, ShieldAlert, CheckCircle2, AlertTriangle, LayoutGrid, List, Eye, HelpCircle, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

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
  const safeActiveFleet = Array.isArray(activeFleet) ? activeFleet : [];
  const safeFraudAlerts = Array.isArray(fraudAlerts) ? fraudAlerts : [];
  const safePmsAlerts = Array.isArray(pmsAlerts) ? pmsAlerts : [];
  const safeProcessedFleet = Array.isArray(processedFleet) ? processedFleet : [];

  if (!isLoadingData && safeActiveFleet.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-24 px-6 text-center bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="w-20 h-20 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center mb-6">
          <Activity className="w-9 h-9 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-100 mb-2 tracking-tighter">Fleet Dashboard Empty</h3>
        <p className="text-slate-400 max-w-sm text-sm mb-8 leading-relaxed font-mono">
          No vehicles or drivers registered yet. Connect your assets and authorize drivers to start monitoring in real-time.
        </p>
      </Card>
    );
  }

  const handleInvestigateClick = (e, anomalyData) => {
    e.preventDefault();
    e.stopPropagation();
    const rootDriver = safeProcessedFleet.find(d => String(d.telegram_id) === String(anomalyData.driver_id)) || anomalyData;
    setSelectedDriver(rootDriver);
  };

  const handleCardClick = (e, driver) => {
    e.preventDefault();
    setSelectedDriver(driver);
  };

  return (
    <div className="space-y-8 tracking-tight">
      {isLoadingData ? (
        <div className="flex items-center justify-center p-16 text-slate-600">
          <Activity className="w-8 h-8 animate-pulse text-cyan-500" />
        </div>
      ) : (
        <>
          {/* CRITICAL WARNINGS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {safeFraudAlerts.length > 0 && (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="col-span-1 md:col-span-2 xl:col-span-2 bg-slate-900 border border-rose-900/40 rounded-xl overflow-hidden shadow-sm"
              >
                <div className="bg-rose-950/20 px-5 py-3.5 border-b border-rose-900/20 flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <h3 className="font-bold text-rose-400 uppercase tracking-wider text-xs">
                    Action Required: {safeFraudAlerts.length} Suspected Fuel Loss Warning{safeFraudAlerts.length > 1 ? 's' : ''}
                  </h3>
                </div>
                <div className="divide-y divide-rose-900/10">
                  {safeFraudAlerts.map(anomaly => (
                    <div 
                      key={`fraud-${anomaly.id}`} 
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors cursor-pointer"
                      onClick={(e) => handleInvestigateClick(e, anomaly)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2.5">
                          <p className="font-bold text-rose-400 font-mono text-lg">{anomaly.vehicle_specs?.model_name || 'Unassigned Vehicle'}</p>
                          <Badge variant="danger">Critical Loss</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs">
                          <span className="text-slate-500">Driver:</span> 
                          <span className="font-bold text-slate-300">{anomaly.driver_name}</span>
                          <span className="text-slate-600">•</span>
                          <span className="font-bold text-rose-400/90">Efficiency: -{anomaly.efficiencyDrop?.toFixed(0)}%</span>
                          <span className="text-slate-600">•</span>
                          <span className="font-bold text-rose-500">Loss: ₱{Number(anomaly.estimatedLoss || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-1.5">{anomaly.alertReason}</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={(e) => handleInvestigateClick(e, anomaly)} 
                        className="self-start sm:self-center uppercase tracking-widest text-[10px] font-bold"
                      >
                        Investigate
                      </Button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {safePmsAlerts.length === 0 && safeFraudAlerts.length === 0 ? (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="col-span-1 md:col-span-2 xl:col-span-3 bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center gap-4 shadow-sm"
              >
                <div className="p-3 bg-slate-800 rounded-lg text-slate-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-200 tracking-tight text-base">All Vehicles Nominal</p>
                  <p className="text-xs text-slate-500 font-mono mt-1">No suspicious fuel drops or urgent maintenance requirements detected.</p>
                </div>
              </motion.div>
            ) : safePmsAlerts.length > 0 && (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className={`col-span-1 ${safeFraudAlerts.length > 0 ? 'xl:col-span-1' : 'md:col-span-2 xl:col-span-3'} bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm`}
              >
                <div className="bg-slate-900 px-5 py-3.5 border-b border-slate-800 flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-amber-400 uppercase tracking-wider text-xs">
                    PMS Due: {safePmsAlerts.length} Vehicle{safePmsAlerts.length > 1 ? 's' : ''}
                  </h3>
                </div>
                <div className="divide-y divide-slate-800">
                  {safePmsAlerts.map(driver => (
                    <div 
                      key={driver.id} 
                      className="p-5 flex flex-col justify-between gap-4 hover:bg-slate-800/30 transition-colors cursor-pointer"
                      onClick={(e) => handleCardClick(e, driver)}
                    >
                      <div>
                        <div className="flex items-center gap-2.5">
                          <p className="font-bold text-amber-400 font-mono text-lg">{driver.vehicle_specs?.model_name || 'Unassigned Vehicle'}</p>
                          <Badge variant="warning">Owed</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="text-slate-500">Driver:</span> 
                          <span className="font-semibold text-slate-300">{driver.driver_name}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary"
                          size="sm"
                          onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation();
                            setPmsModal({ open: true, driver: driver, latestOdo: driver.latestOdo }); 
                          }} 
                          className="w-full uppercase tracking-widest text-[10px] font-bold flex items-center justify-center gap-1.5"
                        >
                          <HelpCircle className="w-3.5 h-3.5" /> How to Log
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* DRIVER ACTIVITY VIEWPORT (BENTO BOX) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Live Fleet Telemetry</h3>
              <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 shadow-inner">
                <Button 
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                  size="icon-xs"
                  onClick={(e) => { e.preventDefault(); setViewMode('grid'); }} 
                  className={viewMode === 'grid' ? 'text-slate-200 bg-slate-800/80' : 'text-slate-500'}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                  size="icon-xs"
                  onClick={(e) => { e.preventDefault(); setViewMode('list'); }} 
                  className={viewMode === 'list' ? 'text-slate-200 bg-slate-800/80' : 'text-slate-500'}
                >
                  <List className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
                {safeProcessedFleet.map((driver, idx) => {
                  const v = driver.vehicle_specs || {};
                  const latestOdo = driver.latestOdo || 0;
                  const nextPms = v.next_pms || (latestOdo + 10000);
                  const distanceToPms = nextPms - latestOdo;
                  const isHealthy = distanceToPms > 1000 && !driver.isFraudulent;
                  
                  // HEALTH BAR MATHEMATICS
                  const healthPercent = Math.max(0, Math.min(100, (distanceToPms / 10000) * 100));
                  let healthColor = 'bg-slate-400';
                  let statusBadgeVariant = 'outline';
                  if (driver.isFraudulent) {
                    statusBadgeVariant = 'danger';
                    healthColor = 'bg-rose-500';
                  } else if (distanceToPms <= 1000) {
                    statusBadgeVariant = 'warning';
                    healthColor = 'bg-amber-500';
                  }

                  // Asymmetrical Bento sizing
                  const colSpan = (idx === 0 || idx === 3) ? "sm:col-span-2 lg:col-span-2 xl:col-span-2" : "col-span-1";

                  return (
                    <motion.div 
                      key={driver.id}
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`
                        ${colSpan}
                        bg-slate-900 border transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between group
                        ${driver.isFraudulent ? 'border-rose-900/60' : 'border-slate-800 hover:border-slate-600'}
                        rounded-2xl
                      `}
                      onClick={(e) => handleCardClick(e, driver)} 
                    >
                      <CardHeader className="pb-4 pt-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <CardTitle className="text-slate-100 text-base font-bold flex items-center gap-1.5 tracking-tight">
                              <User className="w-3.5 h-3.5 text-slate-500" />
                              {driver.driver_name}
                            </CardTitle>
                            <CardDescription className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                              Telegram: {driver.telegram_id}
                            </CardDescription>
                          </div>
                          <Badge variant={statusBadgeVariant}>
                            {driver.isFraudulent ? 'Anomaly' : isHealthy ? 'Nominal' : 'PMS Due'}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 pb-6">
                        <div className="bg-slate-950/50 p-3.5 rounded-lg border border-slate-800/40">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assigned Vehicle</p>
                          <p className="text-sm font-semibold text-slate-200 truncate flex items-center gap-1.5 tracking-tight">
                            <Car className="w-4 h-4 text-slate-400" />
                            {v.model_name || 'Unassigned Vehicle'}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center py-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Odometer</span>
                          <span className="font-bold text-slate-200 font-mono text-base flex items-center gap-1">
                            {latestOdo.toLocaleString()} <span className="text-slate-600 text-xs">km</span>
                          </span>
                        </div>

                        {/* PMS HEALTH BAR */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-bold">
                            <span className="text-slate-500">PMS Remaining</span>
                            <span className={driver.isFraudulent ? 'text-rose-400' : isHealthy ? 'text-slate-400' : 'text-amber-400'}>
                              {distanceToPms > 0 ? `${distanceToPms.toLocaleString()} km` : 'OVERDUE'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800/50 overflow-hidden">
                            <div 
                              className={`h-full ${healthColor} transition-all duration-1000`} 
                              style={{ width: `${healthPercent}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-slate-950 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                      <tr>
                        <th className="px-6 py-4">Driver & Vehicle</th>
                        <th className="px-6 py-4">Current Odometer</th>
                        <th className="px-6 py-4">PMS Health</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {safeProcessedFleet.map(driver => {
                        const v = driver.vehicle_specs || {};
                        const latestOdo = driver.latestOdo || 0;
                        const nextPms = v.next_pms || (latestOdo + 10000);
                        const distanceToPms = nextPms - latestOdo;
                        const isHealthy = distanceToPms > 1000 && !driver.isFraudulent;

                        const healthPercent = Math.max(0, Math.min(100, (distanceToPms / 10000) * 100));
                        let healthColor = 'bg-slate-400';
                        let statusBadgeVariant = 'outline';
                        if (driver.isFraudulent) {
                          statusBadgeVariant = 'danger';
                          healthColor = 'bg-rose-500';
                        } else if (distanceToPms <= 1000) {
                          statusBadgeVariant = 'warning';
                          healthColor = 'bg-amber-500';
                        }

                        return (
                          <tr 
                            key={driver.id} 
                            onClick={(e) => handleCardClick(e, driver)}
                            className={`transition-colors group cursor-pointer ${driver.isFraudulent ? 'hover:bg-rose-950/10' : 'hover:bg-slate-800/30'}`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-slate-200 transition-colors">
                                  <User className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-100 text-sm tracking-tight">{driver.driver_name}</p>
                                  <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                    <Car className="w-3.5 h-3.5" />
                                    {v.model_name || 'Unassigned Vehicle'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-300 text-sm">
                              {latestOdo.toLocaleString()} <span className="text-slate-600 text-xs">km</span>
                            </td>
                            <td className="px-6 py-4 min-w-[200px]">
                               <div className="space-y-1 w-full max-w-xs">
                                  <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-bold">
                                    <span className={driver.isFraudulent ? 'text-rose-400' : isHealthy ? 'text-slate-400' : 'text-amber-400'}>
                                      {distanceToPms > 0 ? `${distanceToPms.toLocaleString()} km left` : 'OVERDUE'}
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800/50 overflow-hidden">
                                    <div className={`h-full ${healthColor} transition-all duration-1000`} style={{ width: `${healthPercent}%` }} />
                                  </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="flex items-center justify-end gap-2">
                                <Badge variant={statusBadgeVariant}>
                                  {driver.isFraudulent ? 'Fuel Drop' : isHealthy ? 'Nominal' : 'PMS Due'}
                                </Badge>
                                <Button 
                                  variant="ghost" 
                                  size="icon-xs"
                                  className="text-slate-500 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </span>
                            </td>
                          </tr>
                        );
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