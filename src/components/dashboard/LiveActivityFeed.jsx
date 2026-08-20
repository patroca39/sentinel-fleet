"use client";

import React from 'react';
import { Activity, Car, ShieldAlert, CheckCircle2, AlertTriangle, LayoutGrid, List, Camera, User, Milestones, Eye, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
      <Card className="flex flex-col items-center justify-center py-24 px-6 text-center bg-slate-900 border border-slate-800 border-dashed rounded-2xl shadow-xl">
        <div className="w-20 h-20 bg-cyan-950/30 border border-cyan-900/40 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.12)]">
          <Activity className="w-9 h-9 text-cyan-400 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-slate-100 mb-2 tracking-tight">Fleet Dashboard Empty</h3>
        <p className="text-slate-400 max-w-sm text-sm mb-8 leading-relaxed font-mono">
          No vehicles or drivers registered yet. Connect your assets and authorize drivers to start monitoring in real-time.
        </p>
      </Card>
    );
  }

  const handleInvestigateClick = (e, anomalyData) => {
    e.preventDefault();
    e.stopPropagation();
    const rootDriver = processedFleet.find(d => String(d.telegram_id) === String(anomalyData.driver_id)) || anomalyData;
    setSelectedDriver(rootDriver);
  };

  const handleCardClick = (e, driver) => {
    e.preventDefault();
    setSelectedDriver(driver);
  };

  return (
    <div className="space-y-8">
      {isLoadingData ? (
        <div className="flex items-center justify-center p-16 text-slate-600">
          <Activity className="w-8 h-8 animate-pulse text-cyan-500" />
        </div>
      ) : (
        <>
          {/* CRITICAL WARNINGS SECTION */}
          <div className="space-y-4">
            {fraudAlerts.length > 0 && (
              <div className="bg-rose-950/15 border border-rose-900/40 rounded-xl overflow-hidden shadow-xl mb-6">
                <div className="bg-rose-950/40 px-5 py-3.5 border-b border-rose-900/40 flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                  <h3 className="font-bold text-rose-400 uppercase tracking-wider text-xs">
                    Action Required: {fraudAlerts.length} Suspected Fuel Loss Warning{fraudAlerts.length > 1 ? 's' : ''}
                  </h3>
                </div>
                <div className="divide-y divide-rose-900/20">
                  {fraudAlerts.map(anomaly => (
                    <div 
                      key={`fraud-${anomaly.id}`} 
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-rose-950/5 hover:bg-rose-950/10 transition-colors"
                    >
                      <div className="flex-1 cursor-pointer" onClick={(e) => handleInvestigateClick(e, anomaly)}>
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
              </div>
            )}

            {pmsAlerts.length === 0 && fraudAlerts.length === 0 ? (
              <div className="bg-emerald-950/10 border border-emerald-900/20 p-6 rounded-xl flex items-center gap-4 shadow-lg">
                <div className="p-3 bg-emerald-900/30 rounded-lg text-emerald-400 shadow-inner">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-emerald-400 tracking-wide text-base">All Vehicles Nominal</p>
                  <p className="text-xs text-slate-400 font-mono mt-1">No suspicious fuel drops or urgent maintenance requirements detected.</p>
                </div>
              </div>
            ) : pmsAlerts.length > 0 && (
              <div className="bg-amber-950/10 border border-amber-900/40 rounded-xl overflow-hidden shadow-xl">
                <div className="bg-amber-950/30 px-5 py-3.5 border-b border-amber-900/30 flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-amber-400 uppercase tracking-wider text-xs">
                    PMS Due: {pmsAlerts.length} Vehicle{pmsAlerts.length > 1 ? 's' : ''}
                  </h3>
                </div>
                <div className="divide-y divide-amber-900/20">
                  {pmsAlerts.map(driver => (
                    <div 
                      key={driver.id} 
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-950/5 hover:bg-amber-950/10 transition-colors"
                    >
                      <div className="flex-1 cursor-pointer" onClick={(e) => handleCardClick(e, driver)}>
                        <div className="flex items-center gap-2.5">
                          <p className="font-bold text-amber-400 font-mono text-lg">{driver.vehicle_specs?.model_name || 'Unassigned Vehicle'}</p>
                          <Badge variant="warning">Maintenance Owed</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="text-slate-500">Driver:</span> 
                          <span className="font-semibold text-slate-300">{driver.driver_name}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-500">Odometer:</span> 
                          <span className="font-mono font-bold text-amber-500">{driver.latestOdo?.toLocaleString() || 0} km</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => handleCardClick(e, driver)} 
                          className="uppercase tracking-widest text-[10px] font-bold"
                        >
                          Details
                        </Button>
                        <Button 
                          variant="secondary"
                          size="sm"
                          onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation();
                            setPmsModal({ open: true, driver: driver, latestOdo: driver.latestOdo }); 
                          }} 
                          className="uppercase tracking-widest text-[10px] font-bold flex items-center gap-1.5 hover:border-amber-500/30 hover:text-amber-400 transition-colors"
                        >
                          <HelpCircle className="w-3.5 h-3.5" /> How to Log
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DRIVER ACTIVITY VIEWPORT */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Live Fleet Telemetry</h3>
              <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 shadow-inner">
                <Button 
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                  size="icon-xs"
                  onClick={(e) => { e.preventDefault(); setViewMode('grid'); }} 
                  className={viewMode === 'grid' ? 'text-cyan-400 bg-slate-800/80 shadow-sm' : 'text-slate-500'}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                  size="icon-xs"
                  onClick={(e) => { e.preventDefault(); setViewMode('list'); }} 
                  className={viewMode === 'list' ? 'text-cyan-400 bg-slate-800/80 shadow-sm' : 'text-slate-500'}
                >
                  <List className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                {processedFleet.map(driver => {
                  const v = driver.vehicle_specs || {};
                  const latestOdo = driver.latestOdo || 0;
                  const nextPms = v.next_pms || (latestOdo + 10000);
                  const distanceToPms = nextPms - latestOdo;
                  const isHealthy = distanceToPms > 1000 && !driver.isFraudulent;
                  
                  // HEALTH BAR MATHEMATICS
                  const healthPercent = Math.max(0, Math.min(100, (distanceToPms / 10000) * 100));
                  let healthColor = 'bg-emerald-500';
                  let statusBadgeVariant = 'success';
                  if (driver.isFraudulent) {
                    statusBadgeVariant = 'danger';
                  } else if (distanceToPms <= 1000) {
                    statusBadgeVariant = 'warning';
                  }

                  if (healthPercent < 10) healthColor = 'bg-rose-500';
                  else if (healthPercent < 30) healthColor = 'bg-amber-500';

                  return (
                    <Card 
                      key={driver.id} 
                      onClick={(e) => handleCardClick(e, driver)} 
                      className={`
                        bg-slate-900 border transition-all duration-200 relative overflow-hidden shadow-md cursor-pointer flex flex-col justify-between group
                        ${driver.isFraudulent ? 'border-rose-900/60 shadow-rose-950/10 hover:border-rose-500/80' : 'border-slate-800/80 hover:border-slate-700 hover:shadow-cyan-950/10'}
                      `}
                    >
                      {/* Brand top edge bar */}
                      <div className={`absolute top-0 left-0 w-full h-1 transition-colors ${driver.isFraudulent ? 'bg-rose-500' : 'bg-slate-800 group-hover:bg-cyan-500'}`} />
                      
                      <CardHeader className="pb-4 pt-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <CardTitle className="text-slate-100 text-base font-bold flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-500" />
                              {driver.driver_name}
                            </CardTitle>
                            <CardDescription className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                              Telegram ID: {driver.telegram_id}
                            </CardDescription>
                          </div>
                          <Badge variant={statusBadgeVariant}>
                            {driver.isFraudulent ? 'Anomaly' : isHealthy ? 'Nominal' : 'PMS Due'}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 pb-6">
                        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/40">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assigned Vehicle</p>
                          <p className="text-sm font-semibold text-slate-200 truncate flex items-center gap-1.5">
                            <Car className="w-4 h-4 text-cyan-400" />
                            {v.model_name || 'Unassigned Vehicle'}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center py-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Odometer</span>
                          <span className="font-bold text-cyan-400 font-mono text-base flex items-center gap-1">
                            {latestOdo.toLocaleString()} <span className="text-slate-600 text-xs">km</span>
                          </span>
                        </div>

                        {/* PMS HEALTH BAR */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-bold">
                            <span className="text-slate-500">PMS Remaining</span>
                            <span className={driver.isFraudulent ? 'text-rose-400' : isHealthy ? 'text-emerald-400' : 'text-amber-400'}>
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
                    </Card>
                  );
                })}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg animate-in fade-in duration-300">
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
                      {processedFleet.map(driver => {
                        const v = driver.vehicle_specs || {};
                        const latestOdo = driver.latestOdo || 0;
                        const nextPms = v.next_pms || (latestOdo + 10000);
                        const distanceToPms = nextPms - latestOdo;
                        const isHealthy = distanceToPms > 1000 && !driver.isFraudulent;

                        const healthPercent = Math.max(0, Math.min(100, (distanceToPms / 10000) * 100));
                        let healthColor = 'bg-emerald-500';
                        let statusBadgeVariant = 'success';
                        if (driver.isFraudulent) {
                          statusBadgeVariant = 'danger';
                        } else if (distanceToPms <= 1000) {
                          statusBadgeVariant = 'warning';
                        }

                        if (healthPercent < 10) healthColor = 'bg-rose-500';
                        else if (healthPercent < 30) healthColor = 'bg-amber-500';

                        return (
                          <tr 
                            key={driver.id} 
                            onClick={(e) => handleCardClick(e, driver)}
                            className={`transition-colors group cursor-pointer ${driver.isFraudulent ? 'hover:bg-rose-950/10' : 'hover:bg-slate-800/30'}`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-900/40 transition-colors">
                                  <User className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-100 text-sm">{driver.driver_name}</p>
                                  <p className="text-xs text-cyan-400/80 font-mono flex items-center gap-1 mt-0.5">
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
                                    <span className={driver.isFraudulent ? 'text-rose-400' : isHealthy ? 'text-emerald-400' : 'text-amber-400'}>
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
                                  className="text-slate-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
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