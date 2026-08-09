"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import { ShieldCheck } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-cyan-500/30 flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-4xl mx-auto px-6 pt-36 pb-24 space-y-12">
        <div className="border-b border-slate-800 pb-8">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">Terms of Service</h1>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Last Updated: August 2026</p>
        </div>

        <div className="space-y-8 text-sm md:text-base leading-relaxed text-slate-400">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
            <p>By registering for and accessing the SentinelFleet Command Center (the "Service"), you agree to be bound by these Terms of Service. The Service is operated by Sentinel Soft Solutions, based in Tacloban City, Philippines.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Description of Service & Fulfillment</h2>
            <p>SentinelFleet is a cloud-based fleet telemetry and fraud detection platform. <strong className="text-cyan-400">Fulfillment Policy:</strong> Upon successful payment authorization via PayMongo, access to the Command Tier infrastructure is granted immediately and automatically. Your digital account is provisioned instantly, and you may begin routing data through the Sentinel Telegram Bot without delay.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Billing, Renewals, and Fleet Expansion</h2>
            <p>The Service is billed on a recurring monthly subscription basis (₱999/month) which includes baseline telemetry processing for up to four (4) vehicles. Expanding the fleet beyond the baseline incurs an automatic infrastructure fee of ₱250/month per additional vehicle.</p>
            <p>All payments are processed securely via PayMongo. You are responsible for providing valid payment information. Subscriptions automatically renew unless canceled prior to the next billing cycle.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Refund & Cancellation Policy</h2>
            <p>Because SentinelFleet provisions proprietary infrastructure and API routing immediately upon subscription, <strong className="text-rose-400">all subscription fees are non-refundable.</strong> You may cancel your subscription at any time within the Command Center. Cancellation prevents future billing, but no prorated refunds are provided for the current billing cycle.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">5. Limitation of Liability</h2>
            <p>Sentinel Soft Solutions provides data analytics and alerts based on the visual telemetry submitted by your drivers. We are not responsible for physical damages, mechanical failures, or actual financial losses incurred by your business. Our fraud detection algorithms are advisory tools, not absolute guarantees against theft.</p>
          </section>
        </div>
      </div>

      <footer className="border-t border-slate-800/50 bg-slate-950 py-8 px-6 text-center text-slate-500 text-xs">
        <p>&copy; 2026 Sentinel Soft Solutions. Tacloban City, Philippines.</p>
      </footer>
    </div>
  );
}
