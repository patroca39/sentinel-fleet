import os
import requests
from dotenv import load_dotenv

def run_diagnostics():
    # Load environment variables dynamically to support Linux/cloud environments
    current_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(current_dir, ".env")
    if os.path.exists(env_path):
        load_dotenv(env_path)
    else:
        load_dotenv() # Fallback to standard loading

    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not bot_token:
        print("[-] Error: TELEGRAM_BOT_TOKEN not found in environment or .env file.")
        return

    # Strip any whitespace
    bot_token = bot_token.strip()

    url = f"https://api.telegram.org/bot{bot_token}/getWebhookInfo"
    print(f"[*] Querying Telegram getWebhookInfo API...")
    response = requests.get(url)
    print(response.text)

if __name__ == "__main__":
    run_diagnostics()
