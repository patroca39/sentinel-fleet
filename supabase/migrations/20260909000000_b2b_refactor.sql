-- B2B Security & Architecture Refactor
-- 1. Add operator_id to node_revocation_logs
ALTER TABLE public.node_revocation_logs ADD COLUMN operator_id TEXT;

-- 2. Enable RLS
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_market_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_revocation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_specs ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Operators can manage their own drivers" ON public.drivers FOR ALL TO authenticated USING (auth.uid()::text = operator_id);
CREATE POLICY "Operators can manage their own anomalies" ON public.fleet_anomalies FOR ALL TO authenticated USING (auth.uid()::text = operator_id);
CREATE POLICY "Fuel market rates are readable by authenticated users" ON public.fuel_market_rates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators can manage their own logs" ON public.logs FOR ALL TO authenticated USING (auth.uid()::text = operator_id);
CREATE POLICY "Operators can manage their own maintenance_logs" ON public.maintenance_logs FOR ALL TO authenticated USING (auth.uid()::text = operator_id);
CREATE POLICY "Operators can manage their own revocation logs" ON public.node_revocation_logs FOR ALL TO authenticated USING (auth.uid()::text = operator_id);
CREATE POLICY "Operators can view and update their own profile" ON public.operator_profiles FOR ALL TO authenticated USING (auth.uid()::text = id);
CREATE POLICY "Operators can manage their own vehicles" ON public.vehicle_specs FOR ALL TO authenticated USING (auth.uid()::text = operator_id);

-- 4. RPC for Atomic Vehicle Registration
CREATE OR REPLACE FUNCTION public.register_vehicle(
  p_operator_id TEXT,
  p_model_name TEXT,
  p_plate_number TEXT,
  p_fuel_type TEXT,
  p_vehicle_type TEXT
)
RETURNS SETOF public.vehicle_specs
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_allowed_fleet_size INT;
  v_current_fleet_size INT;
  v_new_vehicle public.vehicle_specs%ROWTYPE;
BEGIN
  -- Lock the operator profile for update
  SELECT allowed_fleet_size INTO v_allowed_fleet_size
  FROM public.operator_profiles
  WHERE id = p_operator_id
  FOR UPDATE;

  -- Get current fleet size
  SELECT count(*) INTO v_current_fleet_size
  FROM public.vehicle_specs
  WHERE operator_id = p_operator_id;

  IF v_current_fleet_size >= COALESCE(v_allowed_fleet_size, 4) THEN
    RAISE EXCEPTION 'Fleet size limit reached. Please upgrade your subscription.';
  END IF;

  INSERT INTO public.vehicle_specs (
    operator_id, model_name, plate_number, fuel_type, vehicle_type
  ) VALUES (
    p_operator_id, p_model_name, p_plate_number, p_fuel_type, p_vehicle_type
  ) RETURNING * INTO v_new_vehicle;

  RETURN NEXT v_new_vehicle;
END;
$$;
