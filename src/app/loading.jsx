import React from 'react';
import { Activity } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col gap-6 selection:bg-cyan-900 selection:text-cyan-50">
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse"></div>
        <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex items-center justify-center relative z-10">
          <Activity className="w-10 h-10 text-cyan-400 animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Sentinel<span className="font-light text-cyan-400">Fleet</span></h2>
        <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-2 animate-pulse">Synchronizing Telemetry...</p>
      </div>
    </div>
  );
}