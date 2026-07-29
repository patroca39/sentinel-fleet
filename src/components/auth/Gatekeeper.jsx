"use client";

import React, { useEffect, useState } from 'react';
import { Loader2, Lock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

// FIX: Accept setSubscriptionTier as a prop
export default function Gatekeeper({ children, user, setSubscriptionTier }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    let pollInterval;

    async function fetchProfile() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('operator_profiles')
        .select('subscription_tier, created_at')
        .eq('id', user.id)
        .single();
        
      if (!error && data && isMounted) {
        setProfile(data);
        // FIX: Sync the dashboard UI immediately on load
        if (setSubscriptionTier) setSubscriptionTier(data.subscription_tier); 
      }
      setLoading(false);
    }

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');

      if (paymentStatus === 'success') {
        let attempts = 0;
        setLoading(true); 

        const verifyPayment = async () => {
          attempts++;
          const { data } = await supabase
            .from('operator_profiles')
            .select('subscription_tier, created_at')
            .eq('id', user.id)
            .single();

          if (data?.subscription_tier === 'PRO') {
            if (isMounted) {
              setProfile(data);
              // FIX: Sync the dashboard UI immediately upon successful polling
              if (setSubscriptionTier) setSubscriptionTier('PRO');
            }
            clearInterval(pollInterval);
            window.history.replaceState(null, '', window.location.pathname);
            setLoading(false);
          } else if (attempts >= 10) {
            clearInterval(pollInterval);
            window.history.replaceState(null, '', window.location.pathname);
            setLoading(false); 
          }
        };

        verifyPayment();
        pollInterval = setInterval(verifyPayment, 2000);
      } else if (paymentStatus === 'cancelled') {
        window.history.replaceState(null, '', window.location.pathname);
        fetchProfile();
      } else {
        fetchProfile();
      }
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [user, supabase, setSubscriptionTier]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }) 
      });
      
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Failed to generate checkout link");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Payment gateway is temporarily unavailable. Please try again.");
      setCheckoutLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        <p className="text-slate-500 text-sm font-mono tracking-widest uppercase">Authorizing Access...</p>
      </div>
    );
  }

  const isPro = profile?.subscription_tier === 'PRO';
  const isPending = profile?.subscription_tier === 'PRO_PENDING';
  
  const trialEnds = profile?.created_at 
    ? new Date(new Date(profile.created_at).getTime() + 30 * 24 * 60 * 60 * 1000) 
    : new Date(0);
    
  const daysLeft = profile?.created_at 
    ? Math.ceil((trialEnds.getTime() - Date.now()) / (1000 * 3600 * 24)) 
    : 0;
    
  const isExpired = !isPro && !isPending && (daysLeft <= 0);

  if (isPro || (!isExpired && !isPending)) {
    return (
      <div className="relative min-h-screen flex flex-col">
        {!isPro && (
           <div className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs py-2 px-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 font-mono z-50 relative">
              <div className="flex items-center gap-2">
                 <ShieldAlert className="w-4 h-4 text-amber-500" /> 
                 Tactical Pilot Active — {daysLeft} Days Remaining
              </div>
              <button
                 onClick={handleCheckout}
                 disabled={checkoutLoading}
                 className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1.5 px-4 rounded transition-colors flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.3)] disabled:opacity-50"
              >
                 {checkoutLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Upgrade to Pro Now'}
              </button>
           </div>
        )}
        <div className="flex-1">
           {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 relative selection:bg-cyan-500/30">
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
         <Lock className="w-96 h-96" />
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center relative z-10 shadow-2xl">
        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
          <Lock className="w-8 h-8 text-rose-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">
           {isPending ? 'Complete Deployment' : 'Pilot Concluded'}
        </h2>
        
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
           {isPending 
             ? 'Your commercial infrastructure is ready. Authorize payment to unlock your command center and begin scaling your fleet.'
             : 'Your 30-day tactical pilot has ended. Upgrade to the Command Tier to maintain operational control and restore telemetry access.'}
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 mb-6 text-left space-y-3">
           <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Command Tier Includes:</h4>
           <p className="text-xs text-slate-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-500"/> Support for up to 4 vehicles</p>
           <p className="text-xs text-slate-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-500"/> AI Anomaly & Fraud Detection</p>
           <p className="text-xs text-slate-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-500"/> Unlimited Driver Accounts</p>
        </div>

        <button 
          onClick={handleCheckout}
          disabled={checkoutLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
        >
          {checkoutLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authorize ₱999 Deployment'}
        </button>

        <button 
          onClick={handleSignOut} 
          className="mt-6 text-xs text-slate-500 hover:text-white transition-colors"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}