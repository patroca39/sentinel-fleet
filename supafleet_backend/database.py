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
