import os
import requests
from dotenv import load_dotenv

# Dynamically resolve absolute path to .env file to support Linux/cloud environment
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, "supafleet_backend", ".env")
if not os.path.exists(env_path):
    env_path = os.path.join(current_dir, ".env")
    
load_dotenv(env_path)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
if BOT_TOKEN:
    BOT_TOKEN = BOT_TOKEN.strip()
    
WEBHOOK_SECRET = os.getenv("TELEGRAM_WEBHOOK_SECRET")
if WEBHOOK_SECRET:
    WEBHOOK_SECRET = WEBHOOK_SECRET.strip()

# Production endpoint URL
WEBHOOK_URL = "https://sentinel-fleet.onrender.com/telegram-webhook" # Use your exact route here
def bind_telegram_webhook():
    if not BOT_TOKEN or not WEBHOOK_SECRET:
        print("[-] Error: TELEGRAM_BOT_TOKEN or TELEGRAM_WEBHOOK_SECRET not configured.")
        return

    print(f"Attempting to bind webhook to: {WEBHOOK_URL}...")
    
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/setWebhook"
    payload = {
        "url": WEBHOOK_URL,
        "secret_token": WEBHOOK_SECRET,
        "drop_pending_updates": True
    }
    
    response = requests.post(url, json=payload)
    
    try:
        result = response.json()
        if result.get("ok"):
            print("Success! Telegram is now routed to your FastAPI server.")
        else:
            print(f"Telegram rejected the request. Reason: {result.get('description')}")
            
    except Exception as e:
        print(f"Failed to parse response: {response.text}")

if __name__ == "__main__":
    bind_telegram_webhook()
