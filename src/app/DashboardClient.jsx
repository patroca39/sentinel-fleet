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
import LandingPage from '@/components/landing/LandingPage';
import Gatekeeper from '@/components/auth/Gatekeeper'; 
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

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
  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login'; 
    }
  };

  const handleAddVehicle = async (newVehicle) => {
    try {
      const supabase = createClient();
      
      // 1. Write the new vehicle to the database, explicitly linking it to the operator
      const { data, error } = await supabase
        .from('vehicle_specs')
        .insert({
          operator_id: session.user.id,
          ...newVehicle
        })
        .select()
        .single(); // Request the newly created row back

      if (error) throw error;

      // 2. Update the frontend UI with the ACTUAL database record (which contains the real UUID)
      setVehicles(prev => [data, ...(Array.isArray(prev) ? prev : [])]);
      showToast("Vehicle registered successfully", "success");

    } catch (error) {
      console.error("Add Vehicle Error:", error);
      showToast(`Failed to register vehicle: ${error.message}`, "error");
    }
  };

  const handleDeleteVehicle = async (id) => {
    try {
      const supabase = createClient();
      
      // 1. Delete the vehicle from the database securely
      const { error } = await supabase
        .from('vehicle_specs')
        .delete()
        .eq('id', id)
        .eq('operator_id', session.user.id); // Security check to prevent deleting other operators' vehicles

      if (error) throw error;

      // 2. Remove it from the frontend UI
      setVehicles(prev => (Array.isArray(prev) ? prev : []).filter(v => v.id !== id));
      showToast("Vehicle removed from fleet", "success");

    } catch (error) {
      console.error("Delete Vehicle Error:", error);
      showToast(`Failed to delete vehicle: ${error.message}`, "error");
    }
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
    return <LandingPage />;
  }

  // --- AUTHENTICATED DASHBOARD RENDER (WRAPPED IN GATEKEEPER) ---
  return (
    <Gatekeeper user={session.user}>
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
    </Gatekeeper>
  );
}