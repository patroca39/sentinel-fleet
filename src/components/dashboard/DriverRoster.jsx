"use client";

import React from 'react';
import { Lock, Users } from 'lucide-react';

export default function DriverRoster({
  newDriver,
  setNewDriver,
  handleAuthorizeDriver,
  isAuthorizing,
  vehicles,
  drivers,
  handleReassignNode,
  setRevokeModal
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-8 lg:col-span-1 h-fit">
        <h3 className="font-bold text-xl text-slate-100 mb-2 flex items-center gap-2">
          <Lock className="w-5 h-5 text-cyan-500" /> Register A Driver
        </h3>
        <p className="text-slate-500 text-sm font-mono mb-8 pb-6 border-b border-slate-800">
          Add a driver and link them to their Telegram app.
        </p>

        <form className="space-y-6" onSubmit={handleAuthorizeDriver}>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Driver Full Name</label>
            <input type="text" required value={newDriver.driverName} onChange={e => setNewDriver({ ...newDriver, driverName: e.target.value })} placeholder="e.g. John Doe" className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-lg focus:border-cyan-500 font-mono text-sm outline-none text-slate-200 transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Driver Telegram ID</label>
            <input type="text" required value={newDriver.telegramId} onChange={e => setNewDriver({ ...newDriver, telegramId: e.target.value })} placeholder="e.g. 7052039465" className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-lg focus:border-cyan-500 font-mono text-sm outline-none text-slate-200 transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assign Vehicle</label>
            <select required value={newDriver.vehicleId} onChange={e => setNewDriver({ ...newDriver, vehicleId: e.target.value })} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-lg focus:border-cyan-500 font-mono text-sm outline-none text-slate-400 transition-colors">
              <option value="">Select a vehicle from your fleet...</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.model_name}</option>)}
            </select>
          </div>
          <div className="pt-4">
            <button type="submit" disabled={isAuthorizing} className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-4 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-lg shadow-cyan-900/20">
              {isAuthorizing ? <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span> : 'Save Driver Details'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden lg:col-span-2">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h3 className="font-bold text-slate-200 text-sm uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-500" /> Your Dispatch Roster
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300 whitespace-nowrap font-mono">
            <thead className="bg-slate-950 text-slate-500 text-xs">
              <tr>
                <th className="px-6 py-4 uppercase tracking-wider">Driver Info</th>
                <th className="px-6 py-4 uppercase tracking-wider">Assigned Vehicle</th>
                <th className="px-6 py-4 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {drivers.map(driver => (
                <tr key={driver.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-200 text-sm">{driver.driver_name}</p>
                    <p className="text-xs text-slate-500 mt-1">App ID: {driver.telegram_id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={driver.assigned_vehicle_id || ""}
                      onChange={(e) => handleReassignNode(driver.id, e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-cyan-400 font-bold outline-none focus:border-cyan-500 transition-colors w-full max-w-[200px]"
                    >
                      <option value="">No Vehicle Assigned</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.model_name}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setRevokeModal({ open: true, driver: driver, reason: 'Resigned (Voluntary)' })}
                      className="px-4 py-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 text-[10px] font-bold uppercase tracking-widest rounded border border-rose-900/50 transition-colors"
                    >
                      Release Driver
                    </button>
                  </td>
                </tr>
              ))}
              {drivers.length === 0 && (
                <tr><td colSpan="3" className="text-center py-8 text-slate-600">You haven't added any drivers yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}