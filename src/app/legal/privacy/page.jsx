"use client";

import React from 'react';
import Navbar from '@/components/Navbar';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-cyan-500/30 flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-4xl mx-auto px-6 pt-36 pb-24 space-y-12">
        <div className="border-b border-slate-800 pb-8">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Last Updated: August 2026</p>
        </div>

        <div className="space-y-8 text-sm md:text-base leading-relaxed text-slate-400">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Introduction</h2>
            <p>Sentinel Soft Solutions (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting it through our compliance with this policy. This policy applies to the SentinelFleet web dashboard and Telegram integration, in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173) of the Philippines.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-slate-200">Operator Data:</strong> Name, company name, email, and contact information.</li>
              <li><strong className="text-slate-200">Fleet Data:</strong> Vehicle models, plate numbers, and efficiency metrics.</li>
              <li><strong className="text-slate-200">Driver Telemetry:</strong> Driver names, Telegram User IDs, uploaded receipt imagery, maintenance shop locations, and odometer readings.</li>
              <li><strong className="text-slate-200">Payment Info:</strong> Processed securely via PayMongo. We do not store full credit card numbers on our servers.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. How We Use Your Data</h2>
            <p>We use the collected information exclusively to provide the SentinelFleet Service. This includes executing Optical Character Recognition (OCR) on uploaded receipts via our AI partners, calculating fuel efficiency anomalies, generating preventative maintenance alerts, and processing subscription billing.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Data Sharing and Sub-processors</h2>
            <p>We do not sell your operational data. Information is strictly shared with infrastructure sub-processors necessary to run the Service (e.g., Supabase for database hosting, OpenAI for receipt OCR, and PayMongo for payment clearing). All sub-processors are bound by strict confidentiality agreements.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">5. Contact Us</h2>
            <p>For questions or concerns regarding your data privacy, please contact our Data Protection Officer at:</p>
            <p className="font-mono text-cyan-400">rozenpasque@gmail.com</p>
          </section>
        </div>
      </div>

      <footer className="border-t border-slate-800/50 bg-slate-950 py-8 px-6 text-center text-slate-500 text-xs">
        <p>&copy; 2026 Sentinel Soft Solutions. Tacloban City, Philippines.</p>
      </footer>
    </div>
  );
}