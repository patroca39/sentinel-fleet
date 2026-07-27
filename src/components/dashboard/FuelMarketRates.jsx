"use client";

import React from 'react';
import { TrendingUp, Filter, Calendar, Users, FileQuestion, Droplet } from 'lucide-react';
import { format } from 'date-fns';

export default function FuelMarketRates({
  marketRates = [],
  fuelLogs = [],
  vehicles = [],
  ingestionDate = 'all',
  setIngestionDate = () => {},
  ingestionDriver = 'all',
  setIngestionDriver = () => {},
  uniqueVaultDrivers = [],
  filteredFuelLogs = []
}) {
  const activeDiesel = marketRates.find(r => r.fuel_type === 'Diesel');
  const activeGasoline = marketRates.find(r => r.fuel_type === 'Gasoline');

  const displayLogs = filteredFuelLogs.length > 0 ? filteredFuelLogs : fuelLogs;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" /> Active Regional Pump Prices
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-2">Live Market Data • Region 8 - Tacloban</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Active Rate Sync</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950 border border-slate-800/80 p-8 rounded-xl flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Diesel Price</p>
              <p className="text-4xl font-black text-amber-400 font-mono mt-2">
                ₱{activeDiesel ? Number(activeDiesel.price_per_liter).toFixed(2) : '79.00'}
                <span className="text-slate-600 text-sm font-sans font-normal ml-2">/ L</span>
              </p>
              <p className="text-xs text-slate-500 font-mono mt-3">
                Effective: {activeDiesel?.effective_timestamp ? format(new Date(activeDiesel.effective_timestamp), 'MMM dd, yyyy') : 'Jul 21, 2026'}
              </p>
            </div>
            <div className="p-4 bg-amber-950/30 border border-amber-900/40 rounded-xl text-amber-400 font-mono text-sm font-bold">
              EN590
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 p-8 rounded-xl flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500"></div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Gasoline Price</p>
              <p className="text-4xl font-black text-cyan-400 font-mono mt-2">
                ₱{activeGasoline ? Number(activeGasoline.price_per_liter).toFixed(2) : '74.00'}
                <span className="text-slate-600 text-sm font-sans font-normal ml-2">/ L</span>
              </p>
              <p className="text-xs text-slate-500 font-mono mt-3">
                Effective: {activeGasoline?.effective_timestamp ? format(new Date(activeGasoline.effective_timestamp), 'MMM dd, yyyy') : 'Jul 21, 2026'}
              </p>
            </div>
            <div className="p-4 bg-cyan-950/30 border border-cyan-900/40 rounded-xl text-cyan-400 font-mono text-sm font-bold">
              RON95
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h3 className="font-bold text-slate-200 text-sm uppercase tracking-widest flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-500" /> Fuel Activity Logs
          </h3>
        </div>

        {displayLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-slate-900">
            <div className="w-20 h-20 bg-slate-800/50 border border-slate-700/50 rounded-full flex items-center justify-center mb-6">
              <FileQuestion className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-300 mb-2">No Fuel Records Found</h3>
            <p className="text-slate-500 max-w-sm text-sm font-mono">No logs match the selected criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 whitespace-nowrap font-mono">
              <thead className="bg-slate-950 text-slate-500 text-xs">
                <tr>
                  <th className="px-8 py-5 uppercase tracking-wider">Log ID</th>
                  <th className="px-8 py-5 uppercase tracking-wider">Vehicle</th>
                  <th className="px-8 py-5 uppercase tracking-wider">Efficiency</th>
                  <th className="px-8 py-5 uppercase tracking-wider text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {displayLogs.map((log, idx) => {
                  const matchingVehicle = vehicles.find(v => v.id === log.vehicle_id);
                  return (
                    <tr key={log.id || idx} className="hover:bg-slate-800/50">
                      <td className="px-8 py-5 text-slate-500 flex flex-col">
                        <span>#{log.id}</span>
                        <span className="text-[10px] text-slate-600 mt-1">{log.created_at ? format(new Date(log.created_at), 'MMM dd, yyyy') : ''}</span>
                      </td>
                      <td className="px-8 py-5 text-slate-300">{matchingVehicle?.model_name || 'Assigned Fleet Unit'}</td>
                      <td className="px-8 py-5 text-slate-400">{log.efficiency ? `${log.efficiency} km/L` : 'N/A'}</td>
                      <td className="px-8 py-5 font-bold text-cyan-400 text-right text-base">{log.fuel_liters} L</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}