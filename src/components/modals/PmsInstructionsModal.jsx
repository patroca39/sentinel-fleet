"use client";

import React from 'react';
import { X, Wrench, MessageCircle, Camera, CheckCircle2, FileText, Send } from 'lucide-react';

export default function PmsInstructionsModal({
  driver,
  latestOdo,
  onClose
}) {
  const modelName = driver?.vehicle_specs?.model_name || "Assigned Fleet Unit";
  const driverName = driver?.driver_name || "Assigned Driver";

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),_0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors p-2 hover:bg-slate-800 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Header */}
        <div className="p-8 pb-5 border-b border-slate-800/60 bg-slate-950">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
            <Wrench className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
             How to Log PMS & Repairs
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 font-mono">
             SupaFleet Optical OCR Ingestion Flow
          </p>
        </div>

        {/* Step-by-Step Content */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          
          <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-3 text-xs space-y-1">
            <p className="text-slate-500 uppercase tracking-wider font-bold">Target Asset Telemetry</p>
            <p className="font-semibold text-slate-300">{modelName}</p>
            <p className="text-[10px] text-slate-500 font-mono">
              Driver: {driverName} • Current Odo: {latestOdo?.toLocaleString() || '0'} km
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold font-mono text-cyan-400">
                1
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-slate-400" /> Snap Service Invoice
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Instruct <span className="font-bold text-slate-300">{driverName}</span> to take a clear, high-resolution photo of the official receipt or service invoice.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold font-mono text-cyan-400">
                2
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-slate-400" /> Send to Telegram Bot
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The driver sends the photo to the <span className="font-bold text-cyan-400 font-mono">@SupaFleetBot</span> in Telegram. The message is automatically matched via their registered driver ID.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold font-mono text-cyan-400">
                3
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Automated OCR parsing
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The n8n pipeline uses Gemini/GPT Vision to extract odometer readings, total costs, and itemized repairs, saving them securely under multi-tenant isolation.
                </p>
              </div>
            </div>

          </div>

          {/* Mobile Preview Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 font-sans">
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-bold">Driver Interaction Demo</p>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                SF
              </div>
              <div className="space-y-1 text-slate-300">
                <p className="font-bold text-slate-200 font-mono text-[11px]">SupaFleet Telegram Bot</p>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 mt-1 leading-relaxed text-slate-400 text-[11px] font-mono">
                  ⚡ <span className="text-cyan-400 font-bold">PMS Log Registered!</span><br />
                  • Vehicle: {modelName}<br />
                  • Total Cost: ₱3,450.00<br />
                  • Odometer: {((latestOdo || 0) + 5000).toLocaleString()} km
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-900/20"
          >
            I Understand, Got It
          </button>
        </div>

      </div>
    </div>
  );
}