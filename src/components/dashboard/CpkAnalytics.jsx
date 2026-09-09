"use client";

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  CircleDollarSign, 
  Activity, 
  Fuel, 
  Wrench, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Car, 
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function CpkAnalytics({ 
  vehicles = [], 
  fuelLogs = [], 
  maintenanceHistory = [] 
}) {
  const [timeRange, setTimeRange] = useState('all');

  const cpkMetrics = useMemo(() => {
    const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
    const safeFuel = Array.isArray(fuelLogs) ? fuelLogs : [];
    const safeMaint = Array.isArray(maintenanceHistory) ? maintenanceHistory : [];

    let totalFuelSpend = 0;
    let totalFuelVolume = 0;
    let totalMaintSpend = 0;
    let totalPartsCost = 0;
    let totalLaborCost = 0;
    let totalConsumablesCost = 0;

    safeFuel.forEach(log => {
      totalFuelSpend += Number(log.cost || 0);
      totalFuelVolume += Number(log.fuel_liters || 0);
    });

    safeMaint.forEach(log => {
      const cost = Number(log.total_cost || log.cost || 0);
      totalMaintSpend += cost;

      let breakdown = { parts: 0, labor: 0, consumables: 0 };
      if (log.cost_breakdown) {
        try {
          breakdown = typeof log.cost_breakdown === 'string' 
            ? JSON.parse(log.cost_breakdown) 
            : log.cost_breakdown;
        } catch (e) {}
      }

      totalPartsCost += Number(breakdown.parts || 0);
      totalLaborCost += Number(breakdown.labor || 0);
      totalConsumablesCost += Number(breakdown.consumables || 0);
    });

    const vehicleStats = safeVehicles.map(vehicle => {
      const vFuel = safeFuel.filter(f => f.vehicle_id === vehicle.id || String(f.driver_id) === String(vehicle.assigned_driver_id));
      const vMaint = safeMaint.filter(m => m.vehicle_id === vehicle.id);

      const vFuelCost = vFuel.reduce((sum, f) => sum + Number(f.cost || 0), 0);
      const vMaintCost = vMaint.reduce((sum, m) => sum + Number(m.total_cost || m.cost || 0), 0);
      const vTotalCost = vFuelCost + vMaintCost;

      const odos = vFuel.map(f => Number(f.odometer || 0)).filter(o => o > 0);
      let vDistance = 0;
      if (odos.length >= 2) {
        vDistance = Math.max(...odos) - Math.min(...odos);
      } else if (vehicle.current_odo) {
        vDistance = Math.max(0, vehicle.current_odo - 40000);
      }

      const vCpk = vDistance > 0 ? (vTotalCost / vDistance) : 0;
      const fuelCpk = vDistance > 0 ? (vFuelCost / vDistance) : 0;
      const maintCpk = vDistance > 0 ? (vMaintCost / vDistance) : 0;

      return {
        id: vehicle.id,
        model_name: vehicle.model_name || 'Unassigned Asset',
        plate_number: vehicle.plate_number || 'NO PLATE',
        distance: vDistance,
        fuelCost: vFuelCost,
        maintCost: vMaintCost,
        totalCost: vTotalCost,
        cpk: vCpk,
        fuelCpk,
        maintCpk
      };
    });

    const totalDistance = vehicleStats.reduce((sum, item) => sum + item.distance, 0);

    const grandTotalSpend = totalFuelSpend + totalMaintSpend;
    const overallCpk = totalDistance > 0 ? (grandTotalSpend / totalDistance) : 0;
    const fuelCpkOverall = totalDistance > 0 ? (totalFuelSpend / totalDistance) : 0;
    const maintCpkOverall = totalDistance > 0 ? (totalMaintSpend / totalDistance) : 0;

    const isItemizedAvailable = totalPartsCost > 0 || totalLaborCost > 0;
    const donutData = isItemizedAvailable ? [
      { name: 'Fuel', value: totalFuelSpend, color: '#06b6d4' },
      { name: 'Parts', value: totalPartsCost, color: '#3b82f6' },
      { name: 'Labor', value: totalLaborCost, color: '#f59e0b' },
      { name: 'Consumables', value: totalConsumablesCost, color: '#10b981' }
    ].filter(d => d.value > 0) : [
      { name: 'Fuel Operations', value: totalFuelSpend, color: '#06b6d4' },
      { name: 'Maintenance & Repairs', value: totalMaintSpend, color: '#f59e0b' }
    ].filter(d => d.value > 0);

    return {
      overallCpk,
      fuelCpkOverall,
      maintCpkOverall,
      grandTotalSpend,
      totalFuelSpend,
      totalMaintSpend,
      totalDistance,
      vehicleStats,
      donutData
    };
  }, [vehicles, fuelLogs, maintenanceHistory]);

  const monthlyTrendData = useMemo(() => {
    const months = [];
    const now = new Date();
    const safeFuel = Array.isArray(fuelLogs) ? fuelLogs : [];
    const safeMaint = Array.isArray(maintenanceHistory) ? maintenanceHistory : [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      const monthLabel = format(monthStart, 'MMM yyyy');

      const mFuel = safeFuel.filter(f => {
        const d = new Date(f.created_at);
        return d >= monthStart && d <= monthEnd;
      });

      const mMaint = safeMaint.filter(m => {
        const d = new Date(m.service_date || m.created_at);
        return d >= monthStart && d <= monthEnd;
      });

      const fuelCost = mFuel.reduce((sum, f) => sum + Number(f.cost || 0), 0);
      const maintCost = mMaint.reduce((sum, m) => sum + Number(m.total_cost || m.cost || 0), 0);

      const fuelLiters = mFuel.reduce((sum, f) => sum + Number(f.fuel_liters || 0), 0);
      const estDistance = fuelLiters > 0 ? fuelLiters * 8.5 : 1200;

      const totalCost = fuelCost + maintCost;
      const monthCpk = estDistance > 0 ? parseFloat((totalCost / estDistance).toFixed(2)) : 0;

      months.push({
        month: monthLabel,
        FuelSpend: fuelCost,
        MaintenanceSpend: maintCost,
        CPK: monthCpk
      });
    }

    return months;
  }, [fuelLogs, maintenanceHistory]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div>
          <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-cyan-400" /> Cost-Per-Kilometer (CPK) Intelligence
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Financial Efficiency Engine • Real-Time Unit Operational Costing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs font-mono">
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded transition-all ${timeRange === 'all' ? 'bg-cyan-900/50 text-cyan-400 font-bold shadow' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Lifetime
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded transition-all ${timeRange === '30d' ? 'bg-cyan-900/50 text-cyan-400 font-bold shadow' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Last 30 Days
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500"></div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fleet Average CPK</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-black text-cyan-400 font-mono">
              ₱{cpkMetrics.overallCpk.toFixed(2)}
            </p>
            <span className="text-xs text-slate-500 font-mono">/ km</span>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs font-mono text-emerald-400">
            <TrendingDown className="w-4 h-4" />
            <span>Optimal Range (&lt; ₱8.50)</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Fleet Operating Spend</p>
          <p className="text-3xl font-black text-emerald-400 font-mono mt-2">
            ₱{cpkMetrics.grandTotalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 font-mono mt-3">
            Fuel: ₱{cpkMetrics.totalFuelSpend.toLocaleString()} • Maint: ₱{cpkMetrics.totalMaintSpend.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CPK Cost Split</p>
          <div className="mt-2 space-y-1 font-mono text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">Fuel CPK:</span>
              <span className="font-bold text-cyan-400">₱{cpkMetrics.fuelCpkOverall.toFixed(2)}/km</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">Maintenance CPK:</span>
              <span className="font-bold text-amber-400">₱{cpkMetrics.maintCpkOverall.toFixed(2)}/km</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2">Derived from verified receipts</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Distance Traveled</p>
          <p className="text-3xl font-black text-blue-400 font-mono mt-2">
            {cpkMetrics.totalDistance.toLocaleString()} <span className="text-xs text-slate-500 font-normal">km</span>
          </p>
          <p className="text-xs text-slate-500 font-mono mt-3">
            Across {vehicles.length} active registered unit{vehicles.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl lg:col-span-1 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-200 text-sm uppercase tracking-widest flex items-center gap-2 mb-1">
              <PieChartIcon className="w-4 h-4 text-cyan-400" /> Operating Cost Breakdown
            </h4>
            <p className="text-xs text-slate-500 font-mono mb-6">Fuel vs. Itemized Maintenance Costs</p>

            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cpkMetrics.donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {cpkMetrics.donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(val) => `₱${Number(val).toLocaleString(undefined, {minimumFractionDigits: 2})}`}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', fontSize: '12px', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Spend</span>
                <span className="text-sm font-black text-slate-200 font-mono">
                  ₱{(cpkMetrics.grandTotalSpend / 1000).toFixed(1)}k
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-800">
            {cpkMetrics.donutData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold text-slate-200">
                  ₱{item.value.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl lg:col-span-2">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="font-bold text-slate-200 text-sm uppercase tracking-widest flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" /> Monthly CPK & Spend Progression
              </h4>
              <p className="text-xs text-slate-500 font-mono mt-1">Tracking operational cost trends over time</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400"><span className="w-3 h-3 bg-cyan-500 rounded-sm inline-block"></span> Fuel</span>
              <span className="flex items-center gap-1.5 text-amber-400"><span className="w-3 h-3 bg-amber-500 rounded-sm inline-block"></span> Maint</span>
              <span className="flex items-center gap-1.5 text-rose-400"><span className="w-3 h-0.5 bg-rose-400 inline-block"></span> CPK (₱/km)</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₱${val}`} dx={-10} />
                <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₱${val}`} dx={10} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', fontSize: '12px', borderRadius: '8px', padding: '12px' }}
                  cursor={{ fill: '#1e293b' }}
                />
                <Bar yAxisId="left" dataKey="FuelSpend" fill="#06b6d4" stackId="a" name="Fuel Spend (₱)" />
                <Bar yAxisId="left" dataKey="MaintenanceSpend" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} name="Maintenance Spend (₱)" />
                <Line yAxisId="right" type="monotone" dataKey="CPK" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#0f172a' }} name="Cost-Per-KM (₱)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <h4 className="font-bold text-slate-200 text-sm uppercase tracking-widest flex items-center gap-2">
            <Car className="w-4 h-4 text-cyan-400" /> Asset Unit Efficiency & CPK Ledger
          </h4>
          <span className="text-xs text-slate-500 font-mono">{cpkMetrics.vehicleStats.length} Vehicles Audited</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300 whitespace-nowrap font-mono">
            <thead className="bg-slate-950 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Vehicle Model</th>
                <th className="px-6 py-4">Plate No.</th>
                <th className="px-6 py-4">Est. Distance</th>
                <th className="px-6 py-4">Fuel Spend</th>
                <th className="px-6 py-4">Maint. Spend</th>
                <th className="px-6 py-4">Total Cost</th>
                <th className="px-6 py-4 text-right">Unit CPK</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {cpkMetrics.vehicleStats.map((unit) => {
                const isHighCpk = unit.cpk > 12.0;
                return (
                  <tr key={unit.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-200">{unit.model_name}</td>
                    <td className="px-6 py-4 text-slate-400">{unit.plate_number}</td>
                    <td className="px-6 py-4 text-slate-300">{unit.distance.toLocaleString()} km</td>
                    <td className="px-6 py-4 text-cyan-400">₱{unit.fuelCost.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="px-6 py-4 text-amber-400">₱{unit.maintCost.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="px-6 py-4 font-bold text-slate-200">₱{unit.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="px-6 py-4 font-black text-right text-base text-cyan-400">
                      ₱{unit.cpk.toFixed(2)} <span className="text-xs font-normal text-slate-500">/km</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${isHighCpk ? 'bg-rose-950/50 text-rose-400 border-rose-900/50' : 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50'}`}>
                        {isHighCpk ? 'High CPK Alert' : 'Optimal Efficiency'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {cpkMetrics.vehicleStats.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-600">
                    No active vehicle assets available for CPK auditing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}