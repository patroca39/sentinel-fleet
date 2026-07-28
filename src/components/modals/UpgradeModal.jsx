"use client";

import React, { useState } from 'react';
import { X, Zap, CheckCircle2, Loader2 } from 'lucide-react';

export default function UpgradeModal({
  session,
  setShowUpgradeModal,
  setSubscriptionTier,
  showToast
}) {
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  const handleUpgradeClick = async () => {
    setIsProcessingCheckout(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email,
          fleetName: session?.user?.user_metadata?.company_name || 'Sentinel Fleet Operator',
          operatorId: session?.user?.id
        })
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl; 
      } else {
        showToast(data.error || "Failed to initiate checkout", "error");
        setIsProcessingCheckout(false);
      }
    } catch (error) {
      console.error(error);
      showToast("Network error. Please try again.", "error");
      setIsProcessingCheckout(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={() => setShowUpgradeModal(false)}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8 pb-6 border-b border-slate-800 text-center">
          <div className="w-16 h-16 bg-cyan-900/30 border border-cyan-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Premium Fleet Access</h2>
          <p className="text-sm text-slate-400 mt-2">Unlock full operational capacity and remove trial limits.</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-slate-300 text-sm">Unlimited Vehicle Profiles</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-slate-300 text-sm">Real-time Fraud Detection</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-slate-300 text-sm">Automated Maintenance Ledger</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-slate-300 text-sm">Priority Support</span>
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleUpgradeClick}
              disabled={isProcessingCheckout}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-3.5 rounded-lg transition-all flex justify-center items-center gap-2 shadow-lg shadow-cyan-900/20"
            >
              {isProcessingCheckout ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Initializing Gateway...
                </>
              ) : (
                'Activate Premium Subscription'
              )}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest mt-4">Secured by PayMongo API</p>
        </div>
      </div>
    </div>
  );
}