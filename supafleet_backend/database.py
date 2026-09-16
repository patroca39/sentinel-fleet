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
