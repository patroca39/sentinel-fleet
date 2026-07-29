"use client";

import React, { useState, useEffect } from 'react';
import { X, Zap, CheckCircle2, Loader2, ShieldPlus } from 'lucide-react';

export default function UpgradeModal({
  session,
  setShowUpgradeModal,
  setSubscriptionTier,
  showToast
}) {
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);

  useEffect(() => {
    // Check if the user was intercepted while adding a new vehicle
    setIsExpanding(!!localStorage.getItem('pending_expansion_vehicle'));
  }, []);

  const handleUpgradeClick = async () => {
    setIsProcessingCheckout(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id,
          isExpansion: isExpanding // Tell the API to add ₱250 to the final bill
        })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; 
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

  const handleCancel = () => {
    // If they back out, cancel the pending vehicle insertion
    localStorage.removeItem('pending_expansion_vehicle');
    setShowUpgradeModal(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={handleCancel}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8 pb-6 border-b border-slate-800 text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isExpanding ? 'bg-amber-900/30 border border-amber-800' : 'bg-cyan-900/30 border border-cyan-800'}`}>
            {isExpanding ? <ShieldPlus className="w-8 h-8 text-amber-400" /> : <Zap className="w-8 h-8 text-cyan-400" />}
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
             {isExpanding ? 'Fleet Expansion Required' : 'Premium Fleet Access'}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
             {isExpanding ? 'You are adding a vehicle beyond your current limit. Authorize billing to deploy.' : 'Unlock full operational capacity and remove trial limits.'}
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="pt-2">
            <button 
              onClick={handleUpgradeClick}
              disabled={isProcessingCheckout}
              className={`w-full font-bold py-3.5 rounded-lg transition-all flex justify-center items-center gap-2 shadow-lg ${isExpanding ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20' : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-cyan-900/20'}`}
            >
              {isProcessingCheckout ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Initializing Gateway...</>
              ) : (
                isExpanding ? 'Authorize Expansion (+₱250/mo)' : 'Activate Premium Subscription'
              )}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest mt-4">Secured by PayMongo API</p>
        </div>
      </div>
    </div>
  );
}