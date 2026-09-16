import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Robustly load env files from the current file's directory
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY", "")

def get_supabase() -> Client:
    if not url or not key:
        raise ValueError("Missing Supabase credentials in environment.")
    return create_client(url, key)

def get_active_driver(telegram_chat_id: str) -> dict | None:
    """
    Fetch a driver's profile using their Telegram chat ID.
    Ensures that the driver is active.
    """
    try:
        supabase = get_supabase()
        response = supabase.table("drivers").select("*").eq("telegram_id", str(telegram_chat_id)).eq("is_active", True).execute()
        if response.data:
            return response.data[0]
    except Exception as e:
        print(f"Error fetching active driver: {e}")
    return None

def consume_quota(operator_id: str) -> bool:
    """
    Verify and/or deduct an operator's monthly quota.
    Invokes the 'consume_quota' Supabase RPC.
    If the RPC doesn't exist, gracefully falls back to checking the operator profile exists.
    """
    try:
        supabase = get_supabase()
        
        # Try invoking the consume_quota RPC atomically
        try:
            rpc_response = supabase.rpc("consume_quota", {"p_operator_id": operator_id}).execute()
            if rpc_response.data is not None:
                return bool(rpc_response.data)
        except Exception as rpc_err:
            print(f"RPC consume_quota failed, falling back to profile check: {rpc_err}")
            
        # Fallback profile check
        response = supabase.table("operator_profiles").select("*").eq("id", operator_id).execute()
        if response.data:
            return True
    except Exception as e:
        print(f"Error checking/consuming quota: {e}")
    return False

def insert_fuel_receipt(driver_data: dict, data, receipt_id: str):
    """
    Inserts a fuel receipt log into the Supabase 'logs' table.
    """
    supabase = get_supabase()
    
    # Resolve vehicle details if assigned_vehicle_id exists
    vehicle_name = "Unknown Vehicle"
    if driver_data.get("assigned_vehicle_id"):
        try:
            vehicle_resp = supabase.table("vehicle_specs").select("model_name, plate_number").eq("id", driver_data["assigned_vehicle_id"]).execute()
            if vehicle_resp.data:
                v = vehicle_resp.data[0]
                vehicle_name = f"{v.get('model_name', '')} ({v.get('plate_number', '')})".strip()
        except Exception as e:
            print(f"Error fetching vehicle details: {e}")
            
    payload = {
        "operator_id": driver_data.get("operator_id"),
        "driver_id": str(driver_data.get("telegram_id")),
        "driver_name": driver_data.get("driver_name"),
        "vehicle": vehicle_name,
        "fuel_liters": data.liters_filled,
        "cost": data.total_amount,
        "odometer": data.odometer_reading,
        "receipt_id": receipt_id,
        "status": "pending_verification"
    }
    
    try:
        response = supabase.table("logs").upsert(payload, on_conflict="receipt_id").execute()
        return response.data
    except Exception as e:
        print(f"Error inserting fuel receipt: {e}")
        # Robust fallback: if 'status' column doesn't exist, insert without status
        if "status" in str(e).lower() or "column" in str(e).lower():
            payload_fallback = payload.copy()
            payload_fallback.pop("status", None)
            try:
                response = supabase.table("logs").upsert(payload_fallback, on_conflict="receipt_id").execute()
                return response.data
            except Exception as e2:
                print(f"Fallback fuel insert failed: {e2}")
        raise e

def insert_maintenance_receipt(driver_data: dict, data, receipt_id: str):
    """
    Inserts a maintenance receipt log into the Supabase 'maintenance_logs' table.
    """
    supabase = get_supabase()
    
    payload = {
        "operator_id": driver_data.get("operator_id"),
        "driver_id": driver_data.get("id"),  # Int ID
        "vehicle_id": driver_data.get("assigned_vehicle_id"),
        "service_date": data.date,
        "shop_name": data.vendor_name,
        "odometer_at_service": data.odometer_reading,
        "total_cost": data.total_amount,
        "services_performed": data.service_description,
        "receipt_id": receipt_id,
        "status": "pending_verification"
    }
    
    try:
        response = supabase.table("maintenance_logs").upsert(payload, on_conflict="receipt_id").execute()
        return response.data
    except Exception as e:
        print(f"Error inserting maintenance receipt: {e}")
        # Robust fallback if 'status' column doesn't exist
        if "status" in str(e).lower() or "column" in str(e).lower():
            payload_fallback = payload.copy()
            payload_fallback.pop("status", None)
            try:
                response = supabase.table("maintenance_logs").upsert(payload_fallback, on_conflict="receipt_id").execute()
                return response.data
            except Exception as e2:
                print(f"Fallback maintenance insert failed: {e2}")
        raise e

def update_receipt_status(receipt_id: str, status: str) -> bool:
    """
    Update the status of a receipt in either logs or maintenance_logs.
    """
    try:
        supabase = get_supabase()
        # Try updating logs table first
        resp_logs = supabase.table("logs").update({"status": status}).eq("receipt_id", receipt_id).execute()
        # Also try updating maintenance_logs table
        resp_maint = supabase.table("maintenance_logs").update({"status": status}).eq("receipt_id", receipt_id).execute()
        
        updated_logs = resp_logs.data if resp_logs else []
        updated_maint = resp_maint.data if resp_maint else []
        return bool((updated_logs and len(updated_logs) > 0) or (updated_maint and len(updated_maint) > 0))
    except Exception as e:
        print(f"Error updating receipt status: {e}")
        return False

def get_latest_pending_receipt_id(chat_id: str) -> str | None:
    """
    Finds the latest pending verification receipt_id for a given driver chat_id.
    Looks in both 'logs' and 'maintenance_logs' tables.
    """
    try:
        supabase = get_supabase()
        driver = get_active_driver(chat_id)
        
        latest_fuel_id = None
        latest_fuel_time = None
        latest_maint_id = None
        latest_maint_time = None
        
        # 1. Check fuel logs (logs table uses telegram_id as driver_id string)
        try:
            fuel_resp = supabase.table("logs").select("receipt_id, created_at").eq("driver_id", str(chat_id)).eq("status", "pending_verification").order("created_at", desc=True).limit(1).execute()
        except Exception:
            # Fallback: query without status filter
            fuel_resp = supabase.table("logs").select("receipt_id, created_at").eq("driver_id", str(chat_id)).order("created_at", desc=True).limit(1).execute()
            
        if fuel_resp.data:
            latest_fuel_id = fuel_resp.data[0].get("receipt_id")
            latest_fuel_time = fuel_resp.data[0].get("created_at")
            
        # 2. Check maintenance logs (uses integer driver_id)
        if driver:
            try:
                maint_resp = supabase.table("maintenance_logs").select("receipt_id, created_at").eq("driver_id", driver["id"]).eq("status", "pending_verification").order("created_at", desc=True).limit(1).execute()
            except Exception:
                # Fallback: query without status filter
                maint_resp = supabase.table("maintenance_logs").select("receipt_id, created_at").eq("driver_id", driver["id"]).order("created_at", desc=True).limit(1).execute()
                
            if maint_resp.data:
                latest_maint_id = maint_resp.data[0].get("receipt_id")
                latest_maint_time = maint_resp.data[0].get("created_at")
                
        # Compare times and return the most recent receipt_id
        if latest_fuel_id and latest_maint_id:
            if latest_fuel_time >= latest_maint_time:
                return latest_fuel_id
            else:
                return latest_maint_id
        elif latest_fuel_id:
            return latest_fuel_id
        elif latest_maint_id:
            return latest_maint_id
            
    except Exception as e:
        print(f"Error getting latest pending receipt: {e}")
    return None
