"use client";

import React, { useState, useEffect } from "react";
import { FleetCpkGauge } from "./components/FleetCpkGauge";
import { FuelEfficiencyLine } from "./components/FuelEfficiencyLine";

// Defensive interface for API payload
interface FleetData {
  cpkScore?: number;
  fuelHistory?: Array<{ date: string; efficiency: number }>;
  activeVehicles?: number;
  unresolvedIncidents?: number;
  totalDistanceKm?: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<FleetData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Graceful fetch pattern from Supabase / API Router
    async function fetchDashboardData() {
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) throw new Error("Failed to fetch");
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load dashboard data defensively:", err);
        setData(null); // Force degradation fallback
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // Graceful Fallback Constants
  const safeCpkScore = typeof data?.cpkScore === "number" ? data.cpkScore : 0;
  const safeFuelHistory = Array.isArray(data?.fuelHistory) ? data.fuelHistory : [];
  const safeActiveVehicles = data?.activeVehicles ?? 0;
  const safeIncidents = data?.unresolvedIncidents ?? 0;
  const safeDistance = data?.totalDistanceKm ?? 0;

  // Determine dynamic health-bar status color classes
  const getCpkHealthColor = (score: number) => {
    if (score < 40) return { bg: "bg-[#EF4444]", text: "text-[#EF4444]", hex: "#EF4444" }; // Rose
    if (score < 75) return { bg: "bg-[#F59E0B]", text: "text-[#F59E0B]", hex: "#F59E0B" }; // Amber
    return { bg: "bg-[#22C55E]", text: "text-[#22C55E]", hex: "#22C55E" }; // Emerald
  };

  const health = getCpkHealthColor(safeCpkScore);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans p-6 md:p-10">
      {/* Upper Navigation / Title */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent">
            SupaFleet Enterprise Control
          </h1>
          <p className="text-slate-400 mt-1">Real-time telemetry and fleet operations dashboard.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-semibold text-slate-300">Live Telemetry Active</span>
        </div>
      </header>

      {/* 4-Column Metric Grid with Defensive Fallbacks & Health-bar accents */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Fleet CPK Index */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 relative overflow-hidden transition hover:border-slate-700">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Fleet CPK Index</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded bg-slate-900 ${health.text}`}>
              {safeCpkScore}% Performance
            </span>
          </div>
          <div className="text-3xl font-black mt-4 text-white">
            {safeCpkScore} <span className="text-lg font-normal text-slate-400">CPK</span>
          </div>
          {/* Health Accent Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
            <div className={`h-full ${health.bg}`} style={{ width: `${Math.min(safeCpkScore, 100)}%` }}></div>
          </div>
        </div>

        {/* Card 2: Active Vehicles */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 relative overflow-hidden transition hover:border-slate-700">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Active Vehicles</span>
            <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-slate-900">Online</span>
          </div>
          <div className="text-3xl font-black mt-4 text-white">
            {safeActiveVehicles} <span className="text-lg font-normal text-slate-400">active</span>
          </div>
          {/* Static Emerald Accent Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#22C55E]"></div>
        </div>

        {/* Card 3: Total Logged Distance */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 relative overflow-hidden transition hover:border-slate-700">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Distance Tracked</span>
            <span className="text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-900">Total KM</span>
          </div>
          <div className="text-3xl font-black mt-4 text-white">
            {safeDistance.toLocaleString()} <span className="text-lg font-normal text-slate-400">KM</span>
          </div>
          {/* Static Amber Accent Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#F59E0B]"></div>
        </div>

        {/* Card 4: Actionable Incidents */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 relative overflow-hidden transition hover:border-slate-700">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Pending Alerts</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded bg-slate-900 ${safeIncidents > 0 ? "text-[#EF4444]" : "text-emerald-400"}`}>
              {safeIncidents > 0 ? "Action Required" : "System Normal"}
            </span>
          </div>
          <div className="text-3xl font-black mt-4 text-white">
            {safeIncidents} <span className="text-lg font-normal text-slate-400">alerts</span>
          </div>
          {/* Dynamic Rose/Emerald Accent Bar based on status */}
          <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${safeIncidents > 0 ? "bg-[#EF4444]" : "bg-[#22C55E]"}`}></div>
        </div>
      </section>

      {/* Main Content Visual Dashboard */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Chart 1: Fleet CPK Score Gauge */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 xl:col-span-1">
          <div className="border-b border-slate-800 pb-4 mb-4">
            <h3 className="font-bold text-lg text-white">Fleet Performance Index</h3>
            <p className="text-xs text-slate-400 mt-1">Direct representation of active CPK relative target limits.</p>
          </div>
          <div className="bg-slate-900/40 rounded-lg p-4 flex justify-center items-center">
            <FleetCpkGauge score={safeCpkScore} />
          </div>
        </div>

        {/* Chart 2: Fuel Efficiency Line Graph */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-6 xl:col-span-2">
          <div className="border-b border-slate-800 pb-4 mb-4">
            <h3 className="font-bold text-lg text-white">Fuel Efficiency Progression</h3>
            <p className="text-xs text-slate-400 mt-1">Defensive area-gradient visualization of MPG over historical routes.</p>
          </div>
          <div className="bg-slate-900/40 rounded-lg p-4">
            <FuelEfficiencyLine data={safeFuelHistory} />
          </div>
        </div>
      </section>
    </div>
  );
}
