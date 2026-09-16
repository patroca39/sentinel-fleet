import os
import requests
from dotenv import load_dotenv

# Dynamically resolve absolute path to .env file to support Linux/cloud environment
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, ".env")
load_dotenv(env_path)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
if BOT_TOKEN:
    BOT_TOKEN = BOT_TOKEN.strip()

def check_webhook_status():
    if not BOT_TOKEN:
        print("[-] Error: TELEGRAM_BOT_TOKEN not found in environment.")
        return
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getWebhookInfo"
    response = requests.get(url)

    # This prints the exact JSON data from Telegram
    print(response.text)

if __name__ == "__main__":
    check_webhook_status()
