"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Receipt, Activity, ShieldAlert, CircleDollarSign, Calendar, User, Droplets, Wrench, MapPin } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden flex flex-col">
      
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto px-6 pt-36 pb-24 space-y-24">
        
        <div className="text-center space-y-4 border-b border-slate-800 pb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">System Manual</h1>
          <p className="text-lg text-slate-400">Mastering the SentinelFleet Command Center.</p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">1. Validating AI Receipt Extraction</h2>
            <p className="text-slate-400 leading-relaxed">
              When your drivers send fuel receipts to the Sentinel Telegram Bot, our Vision AI automatically parses the image. You can review, verify, and manually edit these extracted values directly in the Command Center. 
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl w-full max-w-md mx-auto">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Receipt className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-lg leading-tight">Edit Fuel Receipt</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Log ID: 7f8a-92b1</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Date</p>
                <p className="text-xs font-semibold text-slate-300">July 27, 2026</p>
              </div>
              <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5"><User className="w-3 h-3"/> Driver</p>
                <p className="text-xs font-semibold text-slate-300">Juan Dela Cruz</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                  <CircleDollarSign className="w-3 h-3 text-emerald-500"/> Total Cost (₱)
                </label>
                <div className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 font-mono text-sm">2450.00</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                  <Droplets className="w-3 h-3 text-cyan-500"/> Fuel Volume (Liters)
                </label>
                <div className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 font-mono text-sm">35.76</div>
              </div>
            </div>
          </div>

          <ul className="list-disc list-outside ml-5 space-y-2 text-slate-400 text-sm">
            <li>Navigate to the <strong className="text-cyan-400">Fuel Market & Vault</strong> tab.</li>
            <li>Locate the receipt entry in the ledger and click the View action button.</li>
            <li>If the AI misread a smudge on the physical paper, click into the input box to overwrite the value.</li>
            <li>Click <strong>Save Receipt</strong>. The system will instantly recalculate all fleet efficiency metrics using the new data.</li>
          </ul>
        </div>

        <div className="space-y-8 pt-8 border-t border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">2. Managing Anomaly & Fraud Alerts</h2>
            <p className="text-slate-400 leading-relaxed">
              The system automatically tracks the baseline kilometer-per-liter (km/L) limit of every vehicle. If a driver attempts to siphon fuel or logs anomalous odometer data, the Live Feed will generate a critical alert detailing your estimated financial loss.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-rose-900/50 rounded-xl p-5 w-full max-w-xl mx-auto shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <div className="flex items-start gap-4 pl-2">
              <div className="p-2.5 bg-rose-500/10 rounded-lg border border-rose-500/20 mt-1">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-rose-400 text-base uppercase tracking-wider">Fuel Fraud Detected</h4>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">JUST NOW</span>
                </div>
                <p className="text-sm text-slate-300 mt-1 font-mono">Unit 4 (Mitsubishi Xpander)</p>
                <p className="text-xs text-rose-300/80 mt-2 leading-relaxed">
                  Efficiency plummeted to 6.2 km/L. Baseline limit is 11.5 km/L. Severe anomaly intercepted.
                </p>
                <div className="mt-4 flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Estimated Loss</span>
                  <span className="font-mono font-black text-rose-400 text-lg">₱4,500.00</span>
                </div>
              </div>
            </div>
          </div>

          <ul className="list-disc list-outside ml-5 space-y-2 text-slate-400 text-sm">
            <li>Check the <strong>Live Activity Feed</strong> upon login for active red indicators.</li>
            <li>Click on the specific driver's node to open their operational profile.</li>
            <li>You can confront the driver regarding the anomaly. Once resolved, click <strong>Mark as Resolved</strong> to clear the alert from your primary feed.</li>
          </ul>
        </div>

        <div className="space-y-8 pt-8 border-t border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">3. Itemized Repair Tracking</h2>
            <p className="text-slate-400 leading-relaxed">
              Sentinel Fleet uses Google's Gemini 3.6 Vision AI to automatically handle complex maintenance tracking, ensuring you never miss a PMS (Preventative Maintenance Schedule) interval.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl w-full max-w-lg mx-auto">
             <div className="flex gap-4 border-b border-slate-800 pb-4 mb-4">
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <Wrench className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-lg">Transmission Overhaul</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">Isuzu NQR 71 - Unit 22</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Parts & Components</span>
                  <span className="font-mono text-slate-300">₱65,000.00</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Labor & Services</span>
                  <span className="font-mono text-slate-300">₱18,000.00</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Consumables & Fluids</span>
                  <span className="font-mono text-slate-300">₱2,000.00</span>
                </div>
              </div>
              <div className="bg-slate-900 border-t border-slate-800 p-4 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Billed</span>
                <span className="text-xl font-black text-emerald-400 font-mono">₱85,000.00</span>
              </div>
            </div>
          </div>

          <ul className="list-disc list-outside ml-5 space-y-2 text-slate-400 text-sm">
            <li>Navigate to the <strong className="text-cyan-400">Maintenance & Repairs</strong> tab.</li>
            <li>The ledger lists all historical services. Use the search bar to filter by Shop Location or Vehicle Model.</li>
            <li>Click <strong>View Details</strong> on the far right column to open the JSON breakdown modal and audit parts vs. labor costs.</li>
          </ul>
        </div>

        <div className="space-y-8 pt-8 border-t border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">4. Cost-Per-Kilometer (CPK) Analytics</h2>
            <p className="text-slate-400 leading-relaxed">
              The CPK Intelligence dashboard aggregates all fuel and itemized maintenance logs into a single north-star metric: your Cost-Per-Kilometer. It isolates data down to the individual vehicle, exposing inefficient units that are dragging your margins down.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl w-full max-w-lg mx-auto">
             <div className="flex gap-4 border-b border-slate-800 pb-4 mb-4">
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <CircleDollarSign className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-lg">Cost-Per-Kilometer (CPK)</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">Financial Efficiency Engine</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Fleet Average CPK</p>
                <p className="text-2xl font-black text-cyan-400 font-mono">₱6.45 <span className="text-xs text-slate-500">/km</span></p>
              </div>
              <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Total Operating Spend</p>
                <p className="text-2xl font-black text-emerald-400 font-mono">₱142.5k</p>
              </div>
            </div>
          </div>

          <ul className="list-disc list-outside ml-5 space-y-2 text-slate-400 text-sm">
            <li>Navigate to the <strong className="text-cyan-400">CPK Analytics</strong> tab.</li>
            <li>Filter the dashboard by <strong>Lifetime</strong> or <strong>Last 30 Days</strong> to isolate recent spending spikes.</li>
            <li>Use the <strong>Unit Ledger</strong> at the bottom of the page to find exactly which driver or vehicle is accumulating the highest CPK.</li>
          </ul>
        </div>

      </div>

      <footer className="border-t border-slate-800/50 bg-slate-950 py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 items-center">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center grayscale opacity-40">
              <ShieldCheck className="w-6 h-6 text-slate-500" />
            </div>
            <span className="text-slate-500 text-sm font-bold tracking-wide">
              Sentinel<span className="font-light">Fleet</span>
            </span>
          </div>
          <div className="text-center text-slate-500 text-sm space-y-1.5 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-widest text-slate-600 font-bold mb-1">Contact & Support</p>
            <p>Email: <a href="mailto:rozenpasque@gmail.com" className="hover:text-cyan-400 transition-colors">rozenpasque@gmail.com</a></p>
          </div>
          <div className="text-center md:text-right text-slate-500 text-sm space-y-1.5 flex flex-col justify-center">
            <p>&copy; 2026 <strong className="text-slate-400">Sentinel Soft Solutions</strong></p>
            <p className="text-xs text-slate-600 uppercase tracking-widest font-mono">Tacloban City, Philippines</p>
          </div>
        </div>
      </footer>
    </div>
  );
}