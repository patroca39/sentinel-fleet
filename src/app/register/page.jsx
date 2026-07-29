"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client'; 

function RegisterForm() {
  const searchParams = useSearchParams();
  const tier = searchParams.get('tier') || 'pilot';
  const isPro = tier === 'pro';

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const supabase = createClient();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const trialEndsAt = isPro ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
          contact_person: contactPerson,
          tier: isPro ? 'pro_pending' : 'free',
          trial_ends_at: trialEndsAt,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Handle Supabase "Fake Success" for existing emails
    if (data?.user && data.user.identities && data.user.identities.length === 0) {
      if (isPro) {
        setError("Account already exists. To process your Pro upgrade, please log in to the Command Center and click 'Upgrade to Pro Now'.");
      } else {
        setError("An account with this email already exists. Please proceed to the Command Center Login.");
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Credentials Secured</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          We have sent a verification link to <span className="text-white font-medium">{email}</span>. 
          Please verify your email to access the Command Center.
        </p>
        <Link href="/login" className="w-full block bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors">
          Proceed to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
      {isPro && (
        <div className="absolute top-0 right-0 bg-cyan-500 text-xs font-bold px-4 py-1 rounded-bl-lg text-black">
          PRO TIER
        </div>
      )}

      <div className="flex flex-col items-center mb-8">
        <div className={`w-12 h-12 bg-slate-950 border rounded-xl flex items-center justify-center mb-4 shadow-inner ${isPro ? 'border-cyan-500/50' : 'border-slate-800'}`}>
          <Shield className={`w-6 h-6 ${isPro ? 'text-cyan-400' : 'text-slate-400'}`} />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {isPro ? 'Deploy Command Tier' : 'Initiate Tactical Pilot'}
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          {isPro ? 'Base fleet infrastructure (₱999/mo).' : '30-Day Evaluation. No credit card required.'}
        </p>
      </div>

      {error && (
        <div className="bg-rose-950/50 border border-rose-900/50 text-rose-400 p-3 rounded-lg text-sm mb-6 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Company Name</label>
          <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            placeholder="e.g. RozenPasque Transportation Services" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Fleet Operator</label>
          <input type="text" required value={contactPerson} onChange={(e) => setContactPerson(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            placeholder="Owner / Manager Name" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Account Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            placeholder="admin@fleet.com" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Secure Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            placeholder="••••••••" />
        </div>

        <button type="submit" disabled={loading} className={`w-full font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 ${isPro ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isPro ? 'Initialize Deployment' : 'Start 30-Day Pilot')}
        </button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center items-center p-4 py-12 selection:bg-cyan-500/30">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium z-10">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <Suspense fallback={<div className="flex items-center gap-2 text-cyan-500"><Loader2 className="w-5 h-5 animate-spin" /> Loading terminal...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}