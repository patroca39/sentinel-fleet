"use client";

import React, { useState } from 'react';
import { X, CheckCircle2, Shield, Zap, Wrench } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function UpgradeModal({ session, setShowUpgradeModal, setSubscriptionTier, showToast }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    setIsProcessing(true);
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('operator_profiles')
        .update({ subscription_tier: 'PRO' })
        .eq('id', session.user.id);

      if (error) throw error;
      
      setSubscriptionTier('PRO');
      setShowUpgradeModal(false);
      showToast("Successfully upgraded to Pro Tier", "success");
      
    } catch (error) {
      console.error("Upgrade failed:", error);
      showToast("Failed to process upgrade", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <h3 className="font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400"/> System Upgrade
          </h3>
          <button onClick={() => setShowUpgradeModal(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h4 className="text-2xl font-black text-white uppercase tracking-wide">Pro Tier Access</h4>
            <p className="text-slate-400 text-sm">Unlock the full potential of your Command Center.</p>
          </div>

          <div className="bg-slate-950 border border-cyan-900/50 rounded-xl p-6 text-center">
            <div className="flex justify-center items-baseline gap-1">
              <span className="text-4xl font-black text-cyan-400">₱999</span>
              <span className="text-slate-500 font-mono text-sm">/ mo</span>
            </div>
          </div>

          <ul className="space-y-4 text-sm text-slate-300 font-mono">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Support for up to <strong className="text-white">4 registered vehicles</strong> in the base tier.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span><strong className="text-white">₱250 additional premium</strong> per month for each vehicle added beyond the 4-unit baseline.</span>
            </li>
            <li className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span>Real-time AI fuel anomaly detection and financial bleed tracking.</span>
            </li>
            <li className="flex items-start gap-3">
              <Wrench className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <span>Full access to the Lifetime Repair Ledger and automated cost routing.</span>
            </li>
          </ul>

          <button 
            onClick={handleUpgrade}
            disabled={isProcessing}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-widest py-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Authorizing...' : 'Upgrade System Now'}
          </button>
        </div>
      </div>
    </div>
  );
}