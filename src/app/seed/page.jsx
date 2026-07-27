"use client";

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Database, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

export default function SeederPage() {
  const [status, setStatus] = useState('IDLE');
  const [logs, setLogs] = useState([]);

  const logProcess = (msg) => setLogs(prev => [...prev, msg]);

  const runSimulation = async () => {
    setStatus('PROCESSING');
    setLogs([]);
    const supabase = createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to seed data for an operator.");
      logProcess(`Authenticated as Operator: ${user.id}`);

      // 1. PURGE EXISTING DATA
      logProcess("Purging existing anomalies...");
      await supabase.from('fleet_anomalies').delete().eq('operator_id', user.id);
      
      logProcess("Fetching current fleet to purge related logs...");
      const { data: existingVehicles } = await supabase.from('vehicle_specs').select('id').eq('operator_id', user.id);
      const { data: existingDrivers } = await supabase.from('drivers').select('id, telegram_id').eq('operator_id', user.id);
      
      if (existingVehicles?.length > 0) {
        const vIds = existingVehicles.map(v => v.id);
        await supabase.from('maintenance_logs').delete().in('vehicle_id', vIds);
      }
      
      if (existingDrivers?.length > 0) {
        const dIds = existingDrivers.map(d => String(d.telegram_id));
        await supabase.from('logs').delete().in('driver_id', dIds);
      }

      logProcess("Purging drivers and vehicles...");
      await supabase.from('drivers').delete().eq('operator_id', user.id);
      await supabase.from('vehicle_specs').delete().eq('operator_id', user.id);

      // 2. GENERATE 30 VEHICLES
      logProcess("Generating 30 Commercial Vehicles...");
      const models = ['Mitsubishi Xpander Cross', 'Isuzu NQR 71', 'Fuso Canter FE71', 'Toyota Hiace Commuter', 'Nissan Urvan NV350'];
      const types = ['SUV / MPV', 'Heavy Duty Truck', 'Light Truck', 'Van', 'Van'];
      const baselines = [11.5, 4.5, 5.0, 9.0, 9.5];
      
      const newVehicles = Array.from({ length: 30 }).map((_, i) => {
        const modelIndex = i % 5;
        return {
          operator_id: user.id,
          model_name: `${models[modelIndex]} - Unit ${i + 1}`,
          plate_number: `H${String.fromCharCode(65 + (i % 26))}A ${1000 + i}`,
          vehicle_type: types[modelIndex],
          fuel_type: 'Diesel',
          efficiency_limit: baselines[modelIndex],
          current_odo: 40000 + (Math.floor(Math.random() * 20000)),
        };
      });

      const { data: insertedVehicles, error: vErr } = await supabase.from('vehicle_specs').insert(newVehicles).select();
      if (vErr) throw vErr;

      // 3. GENERATE 30 PINOY DRIVERS
      logProcess("Recruiting 30 Drivers...");
      const firstNames = ['Juan', 'Jose', 'Bong', 'Leni', 'Rodrigo', 'Sara', 'Manny', 'Grace', 'Ramon', 'Fidel', 'Corazon', 'Isko', 'Ping', 'Tito', 'Vic', 'Joey', 'Kathryn', 'Nadine', 'Pia', 'Catriona', 'Vilma', 'Sharon', 'Nora', 'Gary', 'Martin', 'Lea', 'Sarah', 'Regine', 'Aga', 'Dingdong'];
      const lastNames = ['Dela Cruz', 'Santos', 'Reyes', 'Garcia', 'Mendoza', 'Cruz', 'Bautista', 'Ocampo', 'Aquino', 'Marcos', 'Macapagal', 'Rizal', 'Bonifacio', 'Luna', 'Mabini', 'Silang', 'Aguinaldo', 'Gomez', 'Burgos', 'Zamora', 'Poe', 'Sotto', 'Revillame', 'Geronimo', 'Valenciano', 'Nievera', 'Cuneta', 'Soriano', 'Villanueva', 'Tolentino'];
      
      const newDrivers = insertedVehicles.map((v, i) => ({
        operator_id: user.id,
        driver_name: `${firstNames[i]} ${lastNames[i]}`,
        // DYNAMIC UNIQUE ID: Uses the first chunk of the Operator's UUID to prevent collisions
        telegram_id: `TG-${user.id.split('-')[0]}-${i}`, 
        assigned_vehicle_id: v.id
      }));

      const { data: insertedDrivers, error: dErr } = await supabase.from('drivers').insert(newDrivers).select();
      if (dErr) throw dErr;

      // 4. GENERATE 30 DAYS OF LOGS (900 rows) & EDGE CASES
      logProcess("Simulating 30 days of regional transit operations...");
      const fuelLogsData = [];
      const anomaliesData = [];
      const maintenanceData = [];
      
      const today = new Date();

      insertedDrivers.forEach((driver, index) => {
        const vehicle = insertedVehicles.find(v => v.id === driver.assigned_vehicle_id);
        let currentOdo = vehicle.current_odo - 4500;
        
        const isFraudCase = index === 4;
        const isMissedPMS = index === 12;
        const isMajorRepair = index === 22;

        for (let day = 30; day >= 0; day--) {
          const logDate = new Date(today);
          logDate.setDate(today.getDate() - day);
          
          const dailyDistance = 120 + Math.floor(Math.random() * 50);
          currentOdo += dailyDistance;

          let dailyEfficiency = vehicle.efficiency_limit + (Math.random() * 0.5 - 0.2); 
          
          if (isFraudCase && day <= 5) {
            dailyEfficiency = vehicle.efficiency_limit * 0.58; 
          }

          const litersPumped = (dailyDistance / dailyEfficiency).toFixed(2);
          const pumpCost = (litersPumped * 68.50).toFixed(2);

          fuelLogsData.push({
            operator_id: user.id,
            driver_id: String(driver.telegram_id),
            driver_name: driver.driver_name,
            odometer: currentOdo,
            fuel_liters: parseFloat(litersPumped),
            cost: parseFloat(pumpCost),
            created_at: logDate.toISOString()
          });

          if (isFraudCase && day === 5) {
            anomaliesData.push({
              operator_id: user.id,
              driver_id: String(driver.telegram_id),
              vehicle_id: vehicle.id,
              alert_type: 'FUEL_ANOMALY',
              efficiency_drop: 42.0,
              estimated_loss: 4500.00,
              alert_reason: `Efficiency plummeted to ${dailyEfficiency.toFixed(2)} km/L. Limit is ${vehicle.efficiency_limit} km/L.`,
              is_resolved: false,
              created_at: logDate.toISOString()
            });
          }
        }

        if (!isMissedPMS) {
           const pmDate = new Date(today);
           pmDate.setDate(today.getDate() - 15);
           
           const isOrmocRepair = isMajorRepair || Math.random() > 0.7;
           const shop = isOrmocRepair ? 'Ormoc Heavy Mechanics' : 'Tacloban Auto Repair';
           const totalCost = isMajorRepair ? 85000 : 4500 + Math.floor(Math.random() * 2000);
           
           const breakdown = isMajorRepair 
             ? { parts: 65000, labor: 18000, consumables: 2000 }
             : { parts: totalCost - 1500, labor: 1200, consumables: 300 };

           maintenanceData.push({
             operator_id: user.id,
             vehicle_id: vehicle.id,
             service_date: pmDate.toISOString(),
             odometer_at_service: currentOdo - 2000,
             total_cost: totalCost,
             service_type: isMajorRepair ? 'Transmission Overhaul' : 'Standard 10K PMS',
             service_notes: `Service completed at ${shop}.`,
             shop_location: shop,
             cost_breakdown: breakdown
           });
        }
      });

      // 5. BATCH INSERT
      logProcess("Uploading 900 fuel receipts...");
      for (let i = 0; i < fuelLogsData.length; i += 300) {
        const chunk = fuelLogsData.slice(i, i + 300);
        const { error: logErr } = await supabase.from('logs').insert(chunk);
        if (logErr) throw logErr;
      }

      logProcess("Filing maintenance ledgers and anomaly flags...");
      if (maintenanceData.length > 0) {
        const { error: mErr } = await supabase.from('maintenance_logs').insert(maintenanceData);
        if (mErr) throw mErr;
      }
      
      if (anomaliesData.length > 0) {
        const { error: aErr } = await supabase.from('fleet_anomalies').insert(anomaliesData);
        if (aErr) throw aErr;
      }

      setStatus('SUCCESS');
      logProcess("✅ SIMULATION DATA SUCCESSFULLY INJECTED.");

    } catch (error) {
      console.error(error);
      setStatus('ERROR');
      logProcess(`❌ FATAL ERROR: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Database className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wide">Database Overwrite</h1>
            <p className="text-slate-400 text-sm mt-1">Inject 30-day operational simulation data.</p>
          </div>
        </div>

        <div className="bg-rose-950/30 border border-rose-900/50 p-5 rounded-xl mb-8 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0" />
          <div className="text-sm text-rose-200/80">
            <strong className="text-rose-400 block mb-1 uppercase tracking-wider">Warning: Destructive Action</strong>
            Clicking the button below will permanently wipe all existing drivers, vehicles, and logs attached to your current login session before generating the test data.
          </div>
        </div>

        <button 
          onClick={runSimulation}
          disabled={status === 'PROCESSING'}
          className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-3 uppercase tracking-widest"
        >
          {status === 'PROCESSING' ? <><Loader2 className="w-5 h-5 animate-spin"/> Executing Injection...</> : 'Deploy Fleet Simulation'}
        </button>

        {logs.length > 0 && (
          <div className="mt-8 bg-slate-950 rounded-xl border border-slate-800 p-5 font-mono text-xs text-slate-400 space-y-2 max-h-64 overflow-y-auto">
            {logs.map((log, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                <span className={log.includes('❌') ? 'text-rose-400' : log.includes('✅') ? 'text-emerald-400' : 'text-slate-300'}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="mt-6 p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-xl flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-bold">Data injected. Return to your root dashboard to view the changes.</span>
          </div>
        )}
      </div>
    </div>
  );
}