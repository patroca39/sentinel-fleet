"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, Shield, ShieldAlert, ShieldCheck, ArrowRight, MessageSquare, BrainCircuit, LineChart, CheckCircle2, Loader2, Scan, Menu, X } from 'lucide-react';
import Navbar from '../Navbar';
export default function LandingPage({ setAuthMode, setShowLoginModal }) {
  const [activeStep, setActiveStep] = useState(0);
  const [phase, setPhase] = useState('start'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    const runPhaseCycle = () => {
      if (!isSubscribed) return;
      setPhase('start');
      setTimeout(() => { if (isSubscribed) setPhase('process') }, 1000);
      setTimeout(() => { if (isSubscribed) setPhase('resolve') }, 2500);
    };

    runPhaseCycle(); 

    const mainTimer = setInterval(() => {
      if (!isSubscribed) return;
      setActiveStep((prev) => (prev + 1) % 4);
      runPhaseCycle();
    }, 4500);

    return () => {
      isSubscribed = false;
      clearInterval(mainTimer);
    };
  }, []);

  const walkthroughSteps = [
    {
      title: "1. Frictionless Driver Reports",
      desc: "Zero friction for your team. Drivers simply snap a photo of the pump receipt and send it to the Sentinel Telegram Bot. No clunky new apps to install or learn.",
      icon: MessageSquare,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      borderColor: "border-blue-400/50",
      visual: (
        <div className="flex flex-col gap-3 p-4 justify-center h-full">
          <div className={`transition-all duration-500 bg-slate-800 rounded-lg p-3 w-5/6 sm:w-3/4 text-xs sm:text-sm text-slate-300 self-end border border-slate-700 ${phase === 'start' ? 'opacity-100' : 'opacity-70'}`}>
            Boss, fueled up unit 2. Attached the receipt.
          </div>
          {(phase === 'process' || phase === 'resolve') && (
            <div className="bg-blue-900/30 border border-blue-800/50 rounded-lg p-3 w-5/6 sm:w-3/4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
               {phase === 'process' ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-400 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />}
               <span className="text-xs sm:text-sm text-slate-300 truncate">
                 {phase === 'process' ? 'Encrypting...' : 'Captured.'}
               </span>
            </div>
          )}
        </div>
      )
    },
    {
      title: "2. Vision AI Extraction",
      desc: "Our proprietary AI instantly scans the receipt image, extracting the odometer reading, total liters, and cost with pinpoint accuracy. Say goodbye to manual data entry.",
      icon: BrainCircuit,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      borderColor: "border-purple-400/50",
      visual: (
        <div className="flex items-center justify-center h-full p-4 relative">
          {phase === 'start' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Scan className="w-12 h-12 sm:w-16 sm:h-16 text-purple-500 animate-pulse" />
            </div>
          )}
          {(phase === 'process' || phase === 'resolve') && (
            <div className="bg-slate-900 border border-purple-500/50 rounded-xl p-3 sm:p-4 z-10 w-full space-y-3 shadow-[0_0_15px_rgba(168,85,247,0.2)] animate-in zoom-in-95">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-[10px] sm:text-xs text-slate-400 font-mono truncate">EXTRACTED_DATA.JSON</span>
                <BrainCircuit className={`w-4 h-4 text-purple-400 flex-shrink-0 ${phase === 'process' ? 'animate-pulse' : ''}`} />
              </div>
              <div className="space-y-1 font-mono text-[10px] sm:text-xs">
                <p className="text-slate-300"><span className="text-purple-400">"odometer":</span> 45210,</p>
                <p className="text-slate-300"><span className="text-purple-400">"liters":</span> 65.0,</p>
                <p className="text-slate-300"><span className="text-purple-400">"cost":</span> 5460.00</p>
              </div>
              {phase === 'resolve' && (
                <div className="text-[8px] sm:text-[10px] text-emerald-400 pt-2 border-t border-slate-800 font-bold uppercase tracking-widest flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="w-3 h-3"/> Digitization Complete
                </div>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      title: "3. Real-Time Dashboard Sync",
      desc: "The verified data is beamed instantly to your Command Center. The system automatically calculates your vehicle's exact kilometer-per-liter (km/L) efficiency.",
      icon: LineChart,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      borderColor: "border-emerald-400/50",
      visual: (
        <div className="p-4 h-full flex flex-col justify-center">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3 sm:p-4 w-full">
             <div className="flex justify-between items-end mb-4">
                <div>
                   <p className="text-[8px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-widest">Efficiency Sync</p>
                   {phase === 'start' ? (
                     <p className="text-xl sm:text-2xl font-black text-slate-700 font-mono mt-1">--.- <span className="text-xs sm:text-sm">km/L</span></p>
                   ) : (
                     <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">4.2 <span className="text-xs sm:text-sm">km/L</span></p>
                   )}
                </div>
                {phase === 'resolve' ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" /> : <LineChart className={`w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 ${phase === 'process' ? 'animate-bounce' : 'opacity-50'}`} />}
             </div>
             <div className="flex items-end gap-1 h-10 sm:h-12">
               {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                 <div key={i} className="flex-1 bg-emerald-500/20 rounded-t" style={{ height: `${h}%` }}>
                   <div className="bg-emerald-400 w-full rounded-t transition-all duration-1000 ease-out" style={{ height: phase !== 'start' ? '100%' : '0%' }}></div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )
    },
    {
      title: "4. Proactive Fraud Interception",
      desc: "If efficiency drops artificially or a driver attempts to siphon fuel, the system immediately intercepts the anomaly and calculates your prevented financial loss.",
      icon: ShieldCheck,
      color: "text-rose-400",
      bgColor: "bg-rose-400/10",
      borderColor: "border-rose-400/50",
      visual: (
        <div className="p-4 h-full flex items-center justify-center">
          <div className={`border rounded-xl p-4 sm:p-5 w-full transition-colors duration-500 ${phase === 'resolve' ? 'bg-emerald-950/40 border-emerald-900/80' : 'bg-rose-950/40 border-rose-900/80'}`}>
            {phase !== 'resolve' ? (
              <>
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 animate-pulse flex-shrink-0" />
                  <h4 className="font-bold text-rose-500 text-xs sm:text-sm uppercase tracking-wide">Anomaly Intercepted</h4>
                </div>
                <p className="text-[10px] sm:text-xs text-rose-400/90 font-mono mb-3 sm:mb-4">Efficiency dropped 32%. Investigating...</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 flex-shrink-0" />
                  <h4 className="font-bold text-emerald-500 text-xs sm:text-sm uppercase tracking-wide">Budget Secured</h4>
                </div>
                <p className="text-[10px] sm:text-xs text-emerald-400/90 font-mono mb-3 sm:mb-4">Fraud flagged. Corrective action logged.</p>
              </>
            )}
            <div className="bg-slate-950 rounded p-2 sm:p-3 border border-slate-800 flex justify-between items-center transition-colors duration-500">
               <span className="text-[8px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-bold">Capital Saved</span>
               <span className={`text-base sm:text-lg font-black font-mono ${phase === 'resolve' ? 'text-emerald-400' : 'text-rose-400'}`}>₱1,623.89</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden flex flex-col">
      
      {/* Navbar */}
      <Navbar setAuthMode={setAuthMode} setShowLoginModal={setShowLoginModal} />

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 sm:pt-40 pb-16 sm:pb-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-900/50 text-cyan-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 sm:mb-4">
              <Shield className="w-3.5 h-3.5" /> Stop Commercial Fuel Theft
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tight leading-tight">
              Protect your margins. <br className="hidden sm:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Automate your fleet.
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed px-2">
              Sentinel Fleet is an AI-powered dispatch and auditing system. Track efficiency, manage repairs, and intercept fuel fraud in real-time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 sm:pt-6 w-full sm:w-auto px-4 sm:px-0">
              <button 
                onClick={() => { setAuthMode('register'); setShowLoginModal(true); }}
                className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-3.5 sm:py-4 rounded-lg uppercase tracking-widest text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
              >
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Animated Walkthrough Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-900/30 border-y border-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4">How Sentinel Works</h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto px-4">A frictionless pipeline from the pump to your Command Center.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center max-w-5xl mx-auto">
              {/* Interactive Visualizer */}
              <div className="relative h-[280px] sm:h-[400px] rounded-xl sm:rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col order-first lg:order-none">
                <div className="h-8 sm:h-10 bg-slate-900 border-b border-slate-800 flex items-center px-3 sm:px-4 gap-1.5 sm:gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/50"></div>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/50"></div>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/50"></div>
                </div>
                <div className="flex-1 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
                  <div className="absolute inset-0 transition-opacity duration-500">
                    {walkthroughSteps[activeStep].visual}
                  </div>
                </div>
              </div>

              {/* Step Indicators */}
              <div className="space-y-3 sm:space-y-4">
                {walkthroughSteps.map((step, index) => {
                  const isActive = activeStep === index;
                  const Icon = step.icon;
                  
                  return (
                    <div 
                      key={index}
                      onClick={() => { setActiveStep(index); setPhase('start'); }}
                      className={`cursor-pointer transition-all duration-300 rounded-xl p-4 sm:p-5 border ${
                        isActive 
                          ? `bg-slate-800/80 border-slate-600 shadow-lg scale-[1.02]` 
                          : `bg-slate-900/30 border-slate-800 hover:bg-slate-800/50`
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`p-2.5 sm:p-3 rounded-lg ${isActive ? step.bgColor : 'bg-slate-950'}`}>
                          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 ${isActive ? step.color : 'text-slate-600'}`} />
                        </div>
                        <div>
                          <h3 className={`font-bold text-sm sm:text-base mb-1 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                            {step.title}
                          </h3>
                          {isActive && (
                            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed animate-in fade-in slide-in-from-top-1">
                              {step.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Module */}
        <section className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4">Transparent Pricing</h2>
              <p className="text-sm sm:text-base text-slate-400">Start for free. Scale when you're ready.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Evaluation Tier</h3>
                <div className="text-2xl sm:text-3xl font-black text-cyan-400 mb-6">Free</div>
                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-slate-600 flex-shrink-0" /> Complete system access</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-slate-600 flex-shrink-0" /> Single vehicle support</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-slate-600 flex-shrink-0" /> Telegram bot integration</li>
                </ul>
                <button 
                  onClick={() => { setAuthMode('register'); setShowLoginModal(true); }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg text-xs sm:text-sm transition-colors"
                >
                  Start Trial
                </button>
              </div>

              <div className="bg-gradient-to-b from-cyan-950 to-slate-900 border border-cyan-800 p-6 sm:p-8 rounded-2xl relative shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                <div className="absolute top-0 right-0 bg-cyan-600 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 sm:px-3 py-1 rounded-bl-lg rounded-tr-xl">
                  Commercial
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Pro Tier</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <div className="text-2xl sm:text-3xl font-black text-cyan-400">₱999</div>
                  <div className="text-slate-500 font-mono text-xs sm:text-sm">/ mo</div>
                </div>
                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" /> Support for up to 4 vehicles</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" /> ₱250/mo per additional vehicle</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" /> AI Anomaly & Fraud Detection</li>
                </ul>
                <button 
                  onClick={() => { setAuthMode('register'); setShowLoginModal(true); }}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg text-xs sm:text-sm transition-colors"
                >
                  Deploy Fleet
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Corporate Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-950 py-10 sm:py-12 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 items-center">
          
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center grayscale opacity-40">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
                  <path d="M 32 10 C 50 10 60 32 60 32 C 60 32 50 54 32 54 C 14 54 4 32 4 32 C 4 32 14 10 32 10 Z" fill="#020617" stroke="#64748b" strokeWidth="2.5" strokeLinejoin="round"/>
                  <circle cx="32" cy="32" r="10" stroke="#64748b" strokeWidth="2.5"/>
                  <circle cx="32" cy="32" r="3.5" fill="#64748b"/>
                  <path d="M 32 18 V 22 M 32 42 V 46 M 18 32 H 22 M 42 32 H 46" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-slate-500 text-xs sm:text-sm font-bold tracking-wide">
              Sentinel<span className="font-light">Fleet</span>
            </span>
          </div>

          <div className="text-center text-slate-500 text-xs sm:text-sm space-y-1 sm:space-y-1.5 flex flex-col justify-center">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-600 font-bold mb-1">Contact & Support</p>
            <p>
              Email: <a href="mailto:rozenpasque@gmail.com" className="text-slate-400 hover:text-cyan-400 transition-colors break-all">rozenpasque@gmail.com</a>
            </p>
            <p className="px-4">
              Phone: <span className="text-slate-400 block sm:inline mt-1 sm:mt-0">096050503433 (Smart)</span> <span className="hidden sm:inline">/</span> <span className="text-slate-400 block sm:inline">09631510210 (TNT)</span>
            </p>
          </div>
          
          <div className="text-center md:text-right text-slate-500 text-xs sm:text-sm space-y-1 sm:space-y-1.5 flex flex-col justify-center">
            <p>&copy; 2026 <strong className="text-slate-400">Sentinel Soft Solutions</strong></p>
            <p className="text-[10px] sm:text-xs text-slate-600 uppercase tracking-widest font-mono">Tacloban City, Philippines</p>
          </div>
          
        </div>
      </footer>
    </div>
  );
}