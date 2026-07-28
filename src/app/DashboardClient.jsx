"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import LiveActivityFeed from '@/components/dashboard/LiveActivityFeed';
import VehicleRegistry from '@/components/dashboard/VehicleRegistry';
import FuelMarketRates from '@/components/dashboard/FuelMarketRates';
import DriverRoster from '@/components/dashboard/DriverRoster';
import RepairLedger from '@/components/dashboard/RepairLedger';

import UpgradeModal from '@/components/modals/UpgradeModal';
import VehicleProfileModal from '@/components/modals/VehicleProfileModal';
import MaintenanceLedgerModal from '@/components/modals/MaintenanceLedgerModal';
import RevokeDriverModal from '@/components/modals/RevokeDriverModal';
import ReceiptScannerModal from '@/components/modals/ReceiptScannerModal';
import RepairDetailsModal from '@/components/modals/RepairDetailsModal';
import AuthModal from '@/components/auth/AuthModal';
import LandingPage from '@/components/landing/LandingPage';
import { createClient } from '@/utils/supabase/client';

export default function DashboardClient({ 
  initialSession = null, 
  initialVehicles = [], 
  initialDrivers = [], 
  initialFuelLogs = [], 
  initialMaintenanceHistory = [], 
  initialMarketRates = [], 
  initialAnomalies = [], 
  initialSubscriptionTier = 'FREE_TRIAL' 
}) {
  const [session, setSession] = useState(initialSession);
  
  // --- AUTHENTICATION STATES ---
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false); 
  const [authForm, setAuthForm] = useState({
    email: '', password: '', companyName: '', contactPerson: ''
  });

  // --- DASHBOARD STATES ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState(initialSubscriptionTier);
  
  // STRICT SAFETY ENFORCEMENT ON STATE
  const [vehicles, setVehicles] = useState(Array.isArray(initialVehicles) ? initialVehicles : []);
  const [drivers, setDrivers] = useState(Array.isArray(initialDrivers) ? initialDrivers : []);
  const [fuelLogs, setFuelLogs] = useState(Array.isArray(initialFuelLogs) ? initialFuelLogs : []);
  const [anomalies, setAnomalies] = useState(Array.isArray(initialAnomalies) ? initialAnomalies : []); 
  
  // --- MODAL & UI STATES ---
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null); 
  const [drillDownLedger, setDrillDownLedger] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedRepairLog, setSelectedRepairLog] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  // --- NEW DRIVER MANAGEMENT STATES ---
  const [newDriver, setNewDriver] = useState({ driverName: '', telegramId: '', vehicleId: '' });
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [revokeModal, setRevokeModal] = useState({ open: false, driver: null, reason: 'Resigned (Voluntary)' });

  // --- ONBOARDING ROUTING LOGIC ---
  useEffect(() => {
    if (session && subscriptionTier === 'FREE_TRIAL') {
      const intendedPlan = localStorage.getItem('intended_plan');
      
      if (intendedPlan === 'pro') {
        setShowUpgradeModal(true);
        localStorage.removeItem('intended_plan');
      }
    }
  }, [session, subscriptionTier]);

  // --- PAYMENT REDIRECT HANDLING ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      
      if (urlParams.get('payment') === 'success') {
        // Optimistically unlock the UI while the webhook updates the DB in the background
        setSubscriptionTier('PRO');
        showToast("Payment successful! Premium features unlocked.", "success");
        
        // Clean up the URL so it doesn't trigger again on a normal page refresh
        window.history.replaceState(null, '', window.location.pathname);
      } 
      else if (urlParams.get('payment') === 'cancelled') {
        showToast("Payment was cancelled.", "info");
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);
  
  // --- LOCKOUT ENFORCEMENT LOGIC ---
  const isTrialExpired = useMemo(() => {
    if (!session || subscriptionTier !== 'FREE_TRIAL') return false;
    
    // Grab the exact millisecond they signed up
    const signupDate = new Date(session.user.created_at).getTime();
    const now = new Date().getTime();
    
    // 30 days expressed in milliseconds
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    
    return (now - signupDate) > thirtyDaysInMs;
  }, [session, subscriptionTier]);

  // --- DATA MAPPING LOGIC ---
  const processedFleet = useMemo(() => {
    const safeDrivers = Array.isArray(drivers) ? drivers : [];
    const safeAnomalies = Array.isArray(anomalies) ? anomalies : [];
    
    return safeDrivers.map(driver => {
      const vSpecs = driver.vehicle_specs || {};
      const isFraudulent = safeAnomalies.some(
        a => String(a.driver_id) === String(driver.telegram_id)
      );
      return {
        ...driver,
        latestOdo: vSpecs.current_odo || 0,
        isFraudulent
      };
    });
  }, [drivers, anomalies]);

  const fraudAlerts = useMemo(() => {
    const driverTotals = {};
    const uniqueAnomalies = [];
    const safeAnomalies = Array.isArray(anomalies) ? anomalies : [];
    const safeDrivers = Array.isArray(drivers) ? drivers : [];
    const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

    for (const anomaly of safeAnomalies) {
      const dId = String(anomaly.driver_id);
      if (!driverTotals[dId]) driverTotals[dId] = 0;
      driverTotals[dId] += Number(anomaly.estimated_loss || 0);
    }

    const seenDrivers = new Set();
    
    for (const anomaly of safeAnomalies) {
      const dId = String(anomaly.driver_id);
      
      if (!seenDrivers.has(dId)) {
        seenDrivers.add(dId);
        
        const driver = safeDrivers.find(d => String(d.telegram_id) === dId) || {};
        const vehicle = safeVehicles.find(v => v.id === anomaly.vehicle_id) || driver.vehicle_specs || {};

        let calculatedDrop = anomaly.efficiency_drop || 0;
        
        if (calculatedDrop === 0 && anomaly.details) {
          const matches = anomaly.details.match(/dropped to ([\d.]+)[\s\S]*Limit is ([\d.]+)/);
          if (matches && matches.length === 3) {
            const current = parseFloat(matches[1]);
            const limit = parseFloat(matches[2]);
            if (limit > 0) calculatedDrop = ((limit - current) / limit) * 100;
          }
        }

        uniqueAnomalies.push({
          id: anomaly.id,
          driver_name: driver.driver_name || 'Unknown Driver',
          vehicle_specs: vehicle,
          efficiencyDrop: calculatedDrop,
          estimatedLoss: driverTotals[dId],
          alertReason: anomaly.alert_reason || anomaly.reason || anomaly.details || 'Suspicious fuel drop detected',
          ...anomaly 
        });
      }
    }
    return uniqueAnomalies;
  }, [anomalies, drivers, vehicles]);

  const pmsAlerts = useMemo(() => {
    const safeFleet = Array.isArray(processedFleet) ? processedFleet : [];
    return safeFleet.filter(driver => {
      const v = driver.vehicle_specs;
      if (!v) return false;
      const currentOdo = v.current_odo || 0;
      const nextPms = v.next_pms || (currentOdo + 10000);
      return (nextPms - currentOdo) <= 1000 && !driver.isFraudulent;
    });
  }, [processedFleet]);

  // --- HANDLERS ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsProcessingAuth(true);
    const supabase = createClient();
    
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: authForm.email,
          password: authForm.password,
        });
        if (error) throw error;
        window.location.reload(); 
      } else {
        const { error } = await supabase.auth.signUp({
          email: authForm.email,
          password: authForm.password,
          options: {
            data: { company_name: authForm.companyName, contact_person: authForm.contactPerson },
            emailRedirectTo: `${window.location.origin}/login`
          }
        });
        if (error) throw error;
        
        setIsRegistered(true);
      }
    } catch (error) {
      console.error("Auth Error:", error.message);
      alert(`Authentication Failed: ${error.message}`);
    } finally {
      setIsProcessingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      window.location.href = '/';
    }
  };

  const handleAddVehicle = async (newVehicle) => {
    setVehicles(prev => [...(Array.isArray(prev) ? prev : []), { id: Date.now(), ...newVehicle }]);
    showToast("Vehicle registered successfully", "success");
  };

  const handleDeleteVehicle = async (id) => {
    setVehicles(prev => (Array.isArray(prev) ? prev : []).filter(v => v.id !== id));
  };

  const handleAuthorizeDriver = async (e) => {
    e.preventDefault();
    setIsAuthorizing(true);
    setTimeout(() => {
      setDrivers(prev => [...(Array.isArray(prev) ? prev : []), { 
        id: Date.now(), 
        driver_name: newDriver.driverName, 
        telegram_id: newDriver.telegramId, 
        assigned_vehicle_id: newDriver.vehicleId 
      }]);
      setNewDriver({ driverName: '', telegramId: '', vehicleId: '' });
      setIsAuthorizing(false);
      showToast("Driver registered successfully", "success");
    }, 500);
  };

  const handleReassignNode = (driverId, newVehicleId) => {
    setDrivers(prev => (Array.isArray(prev) ? prev : []).map(d => d.id === driverId ? { ...d, assigned_vehicle_id: newVehicleId } : d));
  };

  const executeRevoke = () => {
    setDrivers(prev => (Array.isArray(prev) ? prev : []).filter(d => d.id !== revokeModal.driver.id));
    setRevokeModal({ open: false, driver: null, reason: 'Resigned (Voluntary)' });
    showToast("Driver released", "success");
  };

  const handleResolveAnomaly = async (driverId) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('fleet_anomalies')
        .update({ is_resolved: true })
        .eq('operator_id', session.user.id)
        .eq('driver_id', driverId)
        .eq('is_resolved', false);

      if (error) throw error;
      
      setAnomalies(prev => (Array.isArray(prev) ? prev : []).filter(a => String(a.driver_id) !== String(driverId)));
      setSelectedDriver(null); 
      showToast("Anomaly marked as resolved.", "success");
    } catch (error) {
      console.error("Resolve Error:", error);
      showToast("Failed to resolve anomaly.", "error");
    }
  };

  const showToast = (message, type = 'info') => {
    console.log(`[Toast: ${type}]`, message); 
  };

  // --- UNAUTHENTICATED RENDER ---
  if (!session) {
    return (
      <>
        <LandingPage 
          setAuthMode={setAuthMode} 
          setShowLoginModal={setShowLoginModal} 
        />
        {showLoginModal && (
          <AuthModal 
            authMode={authMode}
            setAuthMode={setAuthMode}
            setShowLoginModal={setShowLoginModal}
            isProcessingAuth={isProcessingAuth}
            authForm={authForm}
            setAuthForm={setAuthForm}
            handleAuthSubmit={handleAuthSubmit}
            isRegistered={isRegistered}
          />
        )}
      </>
    );
  }

  // --- EXPIRED TRIAL RENDER ---
  if (isTrialExpired) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-300 relative overflow-hidden">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 bg-red-900/30 border border-red-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 font-bold text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Evaluation Concluded</h2>
          <p className="text-sm text-slate-400">
            Your 30-day operational trial has expired. To restore access to your fleet registry, maintenance ledgers, and fraud alerts, please upgrade to the Pro Tier.
          </p>
          
          <div className="pt-4 space-y-3">
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-3.5 rounded-lg transition-all"
            >
              Activate Premium Access
            </button>
            <button 
              onClick={handleLogout}
              className="w-full bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium py-3 rounded-lg transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Render the Upgrade Modal here so the button works */}
        {showUpgradeModal && (
          <UpgradeModal 
            session={session}
            setShowUpgradeModal={setShowUpgradeModal}
            setSubscriptionTier={setSubscriptionTier}
            showToast={showToast}
          />
        )}
      </div>
    );
  }

  // --- AUTHENTICATED DASHBOARD RENDER ---
  return (
    <div className="min-h-screen bg-slate-950 flex font-sans overflow-hidden text-slate-300 relative">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header 
          activeTab={activeTab} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          subscriptionTier={subscriptionTier} 
        />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {activeTab === 'dashboard' && (
              <LiveActivityFeed 
                isLoadingData={false}
                activeFleet={vehicles}
                fraudAlerts={fraudAlerts}       
                pmsAlerts={pmsAlerts}           
                processedFleet={processedFleet} 
                viewMode={viewMode}
                setViewMode={setViewMode}
                setSelectedDriver={setSelectedDriver} 
                setPmsModal={() => {}}
              />
            )}

            {activeTab === 'assets' && (
              <VehicleRegistry 
                vehicles={vehicles}
                subscriptionTier={subscriptionTier}
                handleAddVehicle={handleAddVehicle}
                handleDeleteVehicle={handleDeleteVehicle}
                showToast={showToast}
                setShowUpgradeModal={setShowUpgradeModal}
              />
            )}
            
            {activeTab === 'fuel' && (
              <FuelMarketRates 
                fuelLogs={fuelLogs}
                vehicles={vehicles}
                marketRates={initialMarketRates || []}
                uniqueVaultDrivers={(Array.isArray(drivers) ? drivers : []).map(d => ({ id: d.telegram_id, name: d.driver_name }))}
                filteredFuelLogs={fuelLogs}
              />
            )}

            {activeTab === 'onboarding' && (
              <DriverRoster 
                newDriver={newDriver}
                setNewDriver={setNewDriver}
                handleAuthorizeDriver={handleAuthorizeDriver}
                isAuthorizing={isAuthorizing}
                vehicles={vehicles}
                drivers={drivers}
                handleReassignNode={handleReassignNode}
                setRevokeModal={setRevokeModal}
              />
            )}

            {activeTab === 'maintenance' && (
              <RepairLedger 
                maintenanceHistory={Array.isArray(initialMaintenanceHistory) ? initialMaintenanceHistory : []}
                isLoadingData={false}
                setSelectedLog={setSelectedRepairLog} 
              />
            )}

          </div>
        </main>
      </div>

      {/* Modals */}
      {showUpgradeModal && (
        <UpgradeModal 
          session={session}
          setShowUpgradeModal={setShowUpgradeModal}
          setSubscriptionTier={setSubscriptionTier}
          showToast={showToast}
        />
      )}

      {selectedDriver && (
        <VehicleProfileModal 
          driver={selectedDriver}
          fuelLogs={fuelLogs}
          maintenanceHistory={Array.isArray(initialMaintenanceHistory) ? initialMaintenanceHistory : []}
          fraudAlerts={fraudAlerts}
          onClose={() => setSelectedDriver(null)}
          onOpenMaintenanceLedger={(driver) => setDrillDownLedger(driver)}
          onResolveAnomaly={handleResolveAnomaly}
        />
      )}

      {drillDownLedger && (
        <MaintenanceLedgerModal
          driver={drillDownLedger}
          maintenanceLogs={Array.isArray(initialMaintenanceHistory) ? initialMaintenanceHistory : []}
          onClose={() => setDrillDownLedger(null)}
        />
      )}

      {selectedReceipt && (
        <ReceiptScannerModal 
          log={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {selectedRepairLog && (
        <RepairDetailsModal 
          log={selectedRepairLog}
          onClose={() => setSelectedRepairLog(null)}
        />
      )}

      {revokeModal.open && (
        <RevokeDriverModal
          revokeModal={revokeModal}
          setRevokeModal={setRevokeModal}
          executeRevoke={executeRevoke}
        />
      )}
    </div>
  );
}