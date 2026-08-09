"use client";

import React, { useState } from 'react';
import { Trash2, Plus, Activity, Settings2, ChevronDown, ChevronUp } from 'lucide-react';

export default function VehicleRegistry({ 
  vehicles = [], 
  subscriptionTier = 'FREE_TRIAL', 
  handleAddVehicle, 
  handleDeleteVehicle, 
  showToast, 
  setShowUpgradeModal 
}) {
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const currentCount = safeVehicles.length;

  const [isAdding, setIsAdding] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [formData, setFormData] = useState({
    // Core frictionless fields
    model_name: '', plate_number: '', vehicle_type: 'SUV / MPV', 
    fuel_type: 'Diesel', efficiency_limit: '', current_odo: '',
    // Advanced fields (Default empty)
    tank_capacity_liters: '', gross_vehicle_weight_kg: '', passenger_capacity: '',
    recommended_oil_type: '', standard_tire_pressure_psi: '',
    expected_route_km: '', route_tolerance_percent: '30'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.model_name || !formData.plate_number || !formData.efficiency_limit || !formData.current_odo) {
      showToast("Please fill in all strict baseline fields.", "error");
      return;
    }

    // Safely parse the payload, setting empty advanced strings back to null for the database
    const vehiclePayload = {
      model_name: formData.model_name,
      plate_number: formData.plate_number,
      vehicle_type: formData.vehicle_type,
      fuel_type: formData.fuel_type,
      efficiency_limit: parseFloat(formData.efficiency_limit),
      current_odo: parseInt(formData.current_odo, 10),
      tank_capacity_liters: formData.tank_capacity_liters ? parseFloat(formData.tank_capacity_liters) : null,
      gross_vehicle_weight_kg: formData.gross_vehicle_weight_kg ? parseInt(formData.gross_vehicle_weight_kg, 10) : null,
      passenger_capacity: formData.passenger_capacity ? parseInt(formData.passenger_capacity, 10) : null,
      recommended_oil_type: formData.recommended_oil_type || null,
      standard_tire_pressure_psi: formData.standard_tire_pressure_psi ? parseInt(formData.standard_tire_pressure_psi, 10) : null,
      expected_route_km: formData.expected_route_km ? parseFloat(formData.expected_route_km) : null,
      route_tolerance_percent: formData.route_tolerance_percent ? parseInt(formData.route_tolerance_percent, 10) : null
    };

    let limitReached = false;
    if (subscriptionTier === 'FREE_TRIAL' && currentCount >= 1) {
      limitReached = true;
    } else if (subscriptionTier === 'PRO' && currentCount >= 4) {
      limitReached = true;
    }

    if (limitReached) {
      localStorage.setItem('pending_expansion_vehicle', JSON.stringify(vehiclePayload));
      setShowUpgradeModal(true);
      setIsAdding(false);
      resetForm();
      return;
    }

    handleAddVehicle(vehiclePayload);
    resetForm();
    setIsAdding(false);
  };

  const resetForm = () => {
    setFormData({
      model_name: '', plate_number: '', vehicle_type: 'SUV / MPV', fuel_type: 'Diesel', efficiency_limit: '', current_odo: '',
      tank_capacity_liters: '', gross_vehicle_weight_kg: '', passenger_capacity: '', recommended_oil_type: '', standard_tire_pressure_psi: '', expected_route_km: '', route_tolerance_percent: '30'
    });
    setShowAdvanced(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-white">Fleet Registry</h2>
          <p className="text-sm text-slate-400">{currentCount} Active Assets</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-slate-100 hover:bg-white text-slate-900 font-bold py-2 px-4 rounded flex items-center gap-2 text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Register Vehicle
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-slate-100 font-bold text-sm uppercase tracking-widest border-b border-slate-800 pb-2">Core Telemetry Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Make & Model *</label>
                <input type="text" required value={formData.model_name} onChange={(e) => setFormData({...formData, model_name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="e.g., Mitsubishi Xpander Cross" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plate Number *</label>
                <input type="text" required value={formData.plate_number} onChange={(e) => setFormData({...formData, plate_number: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="E.G., ABC 1234" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</label>
                <select value={formData.vehicle_type} onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-sm focus:border-cyan-500 outline-none">
                  <option>SUV / MPV</option>
                  <option>Light Truck</option>
                  <option>Heavy Duty Truck</option>
                  <option>Sedan</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Activity className="w-3 h-3"/> Efficiency Limit (km/L) *</label>
                <input type="number" step="0.1" required value={formData.efficiency_limit} onChange={(e) => setFormData({...formData, efficiency_limit: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-sm focus:border-amber-500 outline-none" placeholder="e.g., 11.5" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Settings2 className="w-3 h-3"/> Initial Odo (km) *</label>
                <input type="number" required value={formData.current_odo} onChange={(e) => setFormData({...formData, current_odo: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-sm focus:border-emerald-500 outline-none" placeholder="e.g., 45000" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fuel Type</label>
                <select value={formData.fuel_type} onChange={(e) => setFormData({...formData, fuel_type: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-sm focus:border-cyan-500 outline-none">
                  <option>Diesel</option>
                  <option>Gasoline</option>
                </select>
              </div>
            </div>

            {/* ADVANCED SETTINGS ACCORDION */}
            <div className="mt-6 border border-slate-800 rounded-lg overflow-hidden bg-slate-950/30">
              <button 
                type="button" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full p-4 flex justify-between items-center bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
              >
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Advanced Setup & Thresholds (Optional)</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4 text-cyan-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              
              {showAdvanced && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tank Capacity (Liters)</label>
                    <input type="number" value={formData.tank_capacity_liters} onChange={(e) => setFormData({...formData, tank_capacity_liters: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="e.g., 65" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payload Weight (kg)</label>
                    <input type="number" value={formData.gross_vehicle_weight_kg} onChange={(e) => setFormData({...formData, gross_vehicle_weight_kg: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="e.g., 3500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Passenger Capacity</label>
                    <input type="number" value={formData.passenger_capacity} onChange={(e) => setFormData({...formData, passenger_capacity: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="e.g., 14" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recommended Oil</label>
                    <input type="text" value={formData.recommended_oil_type} onChange={(e) => setFormData({...formData, recommended_oil_type: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="e.g., 15W-40 Synthetic" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Standard Tire PSI</label>
                    <input type="number" value={formData.standard_tire_pressure_psi} onChange={(e) => setFormData({...formData, standard_tire_pressure_psi: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-sm focus:border-cyan-500 outline-none" placeholder="e.g., 35" />
                  </div>
                  <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-rose-900/30 rounded bg-rose-950/10">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-rose-500/80 uppercase tracking-widest">Expected Daily Route (km)</label>
                      <input type="number" value={formData.expected_route_km} onChange={(e) => setFormData({...formData, expected_route_km: e.target.value})} className="w-full bg-slate-950 border border-rose-900/50 rounded p-3 text-slate-200 text-sm focus:border-rose-500 outline-none" placeholder="Fixed route logic trigger" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-rose-500/80 uppercase tracking-widest">Route Variance Tolerance (%)</label>
                      <input type="number" value={formData.route_tolerance_percent} onChange={(e) => setFormData({...formData, route_tolerance_percent: e.target.value})} className="w-full bg-slate-950 border border-rose-900/50 rounded p-3 text-slate-200 text-sm focus:border-rose-500 outline-none" placeholder="e.g., 30" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded text-sm transition-colors">Deploy Vehicle to Fleet</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {safeVehicles.map((v) => (
          <div key={v.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between group hover:border-slate-600 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-200 text-lg leading-tight pr-4">{v.model_name}</h3>
                <button onClick={() => handleDeleteVehicle(v.id)} className="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 font-mono uppercase">{v.vehicle_type} • {v.fuel_type || 'N/A'}</p>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="bg-slate-950 rounded p-3 text-center border border-slate-800/50">
                 <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Plate Number</p>
                 <p className="font-mono text-slate-300 font-bold tracking-wider">{v.plate_number}</p>
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-950/50 rounded p-2 border border-slate-800/30">
                   <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-0.5">Baseline</p>
                   <p className="font-mono text-amber-500/90 text-xs">{v.efficiency_limit || '0.0'} km/L</p>
                </div>
                <div className="flex-1 bg-slate-950/50 rounded p-2 border border-slate-800/30">
                   <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-0.5">Odometer</p>
                   <p className="font-mono text-emerald-500/90 text-xs">{v.current_odo?.toLocaleString() || '0'} km</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}