import { createClient } from '@/utils/supabase/server';
import DashboardClient from './DashboardClient';

export default async function FleetDashboard() {
  const supabase = await createClient();
  
  // 1. Secure Server-Side Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // 2. Reject unauthenticated or spoofed requests
  if (!user || authError) {
    return <DashboardClient initialSession={null} />;
  }

  // 3. Fetch Data Concurrently (Explicit Foreign Keys)
  const [
    { data: vehicles },
    { data: drivers },
    { data: marketRates },
    { data: profile },
    { data: anomaliesData }
  ] = await Promise.all([
    supabase.from('vehicle_specs').select('*').eq('operator_id', user.id).order('id', { ascending: false }),
    // FIX: Explicitly using !fk_driver_vehicle to resolve the database ambiguity
    supabase.from('drivers').select('*, vehicle_specs!fk_driver_vehicle(*)').eq('operator_id', user.id),
    supabase.from('fuel_market_rates').select('*').order('effective_timestamp', { ascending: false }),
    supabase.from('operator_profiles').select('subscription_tier').eq('id', user.id).single(),
    supabase.from('fleet_anomalies').select('*').eq('operator_id', user.id).eq('is_resolved', false).order('created_at', { ascending: false })
  ]);

  // 4. Fetch Logs Based on Drivers AND Active Anomalies
  let fuelLogs = [];
  const registeredDriverIds = (drivers || []).map(d => String(d.telegram_id));
  const anomalyDriverIds = (anomaliesData || []).map(a => String(a.driver_id));
  const allRelevantDriverIds = [...new Set([...registeredDriverIds, ...anomalyDriverIds])];

  if (allRelevantDriverIds.length > 0) {
    const { data: fLogs } = await supabase
      .from('logs')
      .select('*')
      .in('driver_id', allRelevantDriverIds)
      .order('created_at', { ascending: false })
      .limit(100); 
    fuelLogs = fLogs || [];
  }

  // 5. Fetch Maintenance Based on Vehicles
  let maintenanceHistory = [];
  if (vehicles && vehicles.length > 0) {
    const vehicleIds = vehicles.map(v => v.id);
    const { data: mLogs } = await supabase
      // FIX: Explicitly resolving ambiguity here as well to prevent future crashes
      .from('maintenance_logs')
      .select('*, vehicle_specs!fk_maintenance_vehicle(model_name)')
      .in('vehicle_id', vehicleIds)
      .order('id', { ascending: false });
    maintenanceHistory = mLogs || [];
  }

  // 6. Render the Client
  return (
    <DashboardClient
      initialSession={{ user }}
      initialVehicles={vehicles || []}
      initialDrivers={drivers || []}
      initialFuelLogs={fuelLogs}
      initialMaintenanceHistory={maintenanceHistory}
      initialMarketRates={marketRates || []}
      initialAnomalies={anomaliesData || []}
      initialSubscriptionTier={profile?.subscription_tier || 'FREE_TRIAL'}
    />
  );
}