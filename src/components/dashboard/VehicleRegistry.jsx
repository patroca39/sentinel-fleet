"use client";

import React, { useState } from 'react';
import { Trash2, Plus, Activity, Settings2, ShieldCheck } from 'lucide-react';

export default function VehicleRegistry({ 
  vehicles = [], 
  subscriptionTier = 'FREE_TRIAL', 
  allowedFleetSize = null,
  handleAddVehicle, 
  handleDeleteVehicle, 
  showToast, 
  setShowUpgradeModal 
}) {
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const currentCount = safeVehicles.length;

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    model_name: '', plate_number: '', vehicle_type: 'SUV / MPV', 
    fuel_type: 'Diesel', efficiency_limit: '', current_odo: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.model_name || !formData.plate_number || !formData.efficiency_limit || !formData.current_odo) {
      showToast("Please fill in all strict baseline fields.", "error");
      return;
    }

    const vehiclePayload = {
      ...formData,
      efficiency_limit: parseFloat(formData.efficiency_limit),
      current_odo: parseInt(formData.current_odo, 10)
    };

    let limitReached = false;
    
    // Check limit dynamically against database operator profile allowed_fleet_size, falling back to defaults
    const maxAllowed = allowedFleetSize !== null && allowedFleetSize !== undefined
      ? allowedFleetSize
      : (subscriptionTier === 'FREE_TRIAL' ? 1 : 4);

    if (currentCount >= maxAllowed) {
      limitReached = true;
    }

    if (limitReached) {
      localStorage.setItem('pending_expansion_vehicle', JSON.stringify(vehiclePayload));
      setShowUpgradeModal(true);
      setIsAdding(false);
      setFormData({ model_name: '', plate_number: '', vehicle_type: 'SUV / MPV', fuel_type: 'Diesel', efficiency_limit: '', current_odo: '' });
      return;
    }

    handleAddVehicle(vehiclePayload);
    
    setFormData({
      model_name: '', plate_number: '', vehicle_type: 'SUV / MPV', fuel_type: 'Diesel', efficiency_limit: '', current_odo: ''
    });
    setIsAdding(false);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Make & Model</label>
                <input 
                  type="text" 
                  value={formData.model_name}
                  onChange={(e) => setFormData({...formData, model_name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-sm focus:border-cyan-500 outline-none" 
                  placeholder="e.g., Mitsubishi Xpander Cross" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plate Number</label>
                <input 
                  type="text" 
                  value={formData.plate_number}
                  onChange={(e) => setFormData({...formData, plate_number: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-sm focus:border-cyan-500 outline-none" 
                  placeholder="E.G., ABC 1234" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</label>
                <select 
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-sm focus:border-cyan-500 outline-none"
                >
                  <option>SUV / MPV</option>
                  <option>Light Truck</option>
                  <option>Heavy Duty Truck</option>
                  <option>Sedan</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Activity className="w-3 h-3"/> Efficiency Baseline (km/L)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={formData.efficiency_limit}
                  onChange={(e) => setFormData({...formData, efficiency_limit: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-sm focus:border-amber-500 outline-none" 
                  placeholder="e.g., 4.5" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Settings2 className="w-3 h-3"/> Initial Odometer (km)</label>
                <input 
                  type="number" 
                  value={formData.current_odo}
                  onChange={(e) => setFormData({...formData, current_odo: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-sm focus:border-emerald-500 outline-none" 
                  placeholder="e.g., 45000" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fuel Type</label>
                <select 
                  value={formData.fuel_type}
                  onChange={(e) => setFormData({...formData, fuel_type: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 text-sm focus:border-cyan-500 outline-none"
                >
                  <option>Diesel</option>
                  <option>Gasoline</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded text-sm transition-colors">Save Vehicle Setup</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {safeVehicles.map((v) => {
          // PMS HEALTH MATH
          const currentOdo = v.current_odo || 0;
          const nextPms = v.next_pms || (currentOdo + 10000);
          const distanceToPms = nextPms - currentOdo;
          
          const healthPercent = Math.max(0, Math.min(100, (distanceToPms / 10000) * 100));
          let healthColor = 'bg-emerald-500';
          let textColor = 'text-emerald-400';
          
          if (healthPercent < 10) { healthColor = 'bg-rose-500'; textColor = 'text-rose-400'; }
          else if (healthPercent < 30) { healthColor = 'bg-amber-500'; textColor = 'text-amber-400'; }

          return (
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
              
              <div className="mt-6 space-y-4">
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
                    <p className="font-mono text-cyan-400/90 text-xs">{currentOdo.toLocaleString()} km</p>
                  </div>
                </div>

                {/* ASSET PMS HEALTH BAR */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800/50">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                    <span className="text-slate-500 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> PMS Status</span>
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
            </div>
          )
        })}
      </div>
    </div>
  );
}