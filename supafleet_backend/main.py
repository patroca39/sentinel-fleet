import os
from fastapi import FastAPI, Request, BackgroundTasks, HTTPException, Header
import instructor
from openai import OpenAI
from schema import FuelReceiptExtraction, MaintenanceReceiptExtraction
from database import get_supabase
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="SupaFleet B2B Backend")
client = instructor.from_openai(OpenAI(api_key=os.environ.get("OPENAI_API_KEY")))
supabase = get_supabase()

TELEGRAM_SECRET = os.environ.get("TELEGRAM_WEBHOOK_SECRET")

def process_telegram_webhook(payload: dict):
    """
    This runs asynchronously in BackgroundTasks
    Extract data, download image, hit OpenAI via Instructor, and reply to the user.
    """
    import base64
    import hashlib
    import requests
    
    message = payload.get("message", {})
    chat_id = message.get("chat", {}).get("id")
    if not chat_id:
        return
        
    # Send an initial "Processing..." message to the user for Frictionless UX
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not bot_token:
        return
        
    def send_telegram_message(text: str):
        requests.post(
            f"https://api.telegram.org/bot{bot_token}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}
        )
        
    # 0. Gatekeeper Billing Check: Verify Driver & Operator Subscription BEFORE any OpenAI or heavy processing
    try:
        driver_res = supabase.table("drivers").select("operator_id").eq("telegram_id", str(chat_id)).execute()
        if not driver_res.data:
            send_telegram_message("❌ *Unauthorized:* You are not registered as a driver in SupaFleet. Please contact your fleet operator to authorize this Telegram account.")
            return
            
        operator_id = driver_res.data[0].get("operator_id")
        operator_res = supabase.table("operator_profiles").select("subscription_tier").eq("id", operator_id).execute()
        if not operator_res.data:
            send_telegram_message("❌ *Error:* Fleet operator profile not found.")
            return
            
        tier = operator_res.data[0].get("subscription_tier")
        if tier not in ["PRO", "FREE_TRIAL"]:
            send_telegram_message("❌ *Subscription Expired:* Your fleet operator's subscription limits have been reached or expired. Please contact your operator to upgrade.")
            return
    except Exception as e:
        import traceback
        traceback.print_exc()
        send_telegram_message(f"❌ *Database error checking billing status:* {str(e)}")
        return
        
    # Extract photo or document
    photo = message.get("photo")
    document = message.get("document")
    
    file_id = None
    if photo and len(photo) > 0:
        # Get the largest photo size
        file_id = photo[-1].get("file_id")
    elif document and document.get("mime_type", "").startswith("image/"):
        file_id = document.get("file_id")
        
    if not file_id:
        send_telegram_message("📷 Please send a receipt as an image or photo, and I will extract the details for you!")
        return
        
    send_telegram_message("⚡ *Receipt image received!* Analyzing and extracting data via GPT-4o Vision...")
    
    try:
        # 1. Download image from Telegram
        file_info_url = f"https://api.telegram.org/bot{bot_token}/getFile?file_id={file_id}"
        file_info_resp = requests.get(file_info_url, timeout=10)
        if file_info_resp.status_code != 200:
            send_telegram_message("❌ Failed to retrieve image info from Telegram.")
            return
            
        file_path = file_info_resp.json().get("result", {}).get("file_path")
        if not file_path:
            send_telegram_message("❌ Failed to get image file path.")
            return
            
        file_download_url = f"https://api.telegram.org/file/bot{bot_token}/{file_path}"
        image_resp = requests.get(file_download_url, timeout=15)
        if image_resp.status_code != 200:
            send_telegram_message("❌ Failed to download image content.")
            return
            
        image_bytes = image_resp.content
        
        # 2. Deduplication Check (receipt_id = hash)
        image_hash = hashlib.md5(image_bytes).hexdigest()
        
        # 3. OpenAI Extraction with Guardrails
        # Prepare image for OpenAI Vision API (Base64 encoding)
        encoded_image = base64.b64encode(image_bytes).decode("utf-8")
        image_data_url = f"data:image/jpeg;base64,{encoded_image}"
        
        # First, classify the receipt type (Fuel vs Maintenance)
        classification_prompt = (
            "Analyze this receipt image and classify it as either 'fuel' or 'maintenance'. "
            "Respond with exactly one word: either 'fuel' or 'maintenance'."
        )
        
        classification_resp = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": classification_prompt},
                        {"type": "image_url", "image_url": {"url": image_data_url}},
                    ],
                }
            ],
            max_tokens=10,
        )
        
        receipt_type = classification_resp.choices[0].message.content.strip().lower()
        if "maintenance" in receipt_type:
            # Extract as Maintenance Receipt
            extraction = client.chat.completions.create(
                model="gpt-4o",
                response_model=MaintenanceReceiptExtraction,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Extract maintenance receipt data. Be extremely accurate."},
                            {"type": "image_url", "image_url": {"url": image_data_url}},
                        ],
                    }
                ],
            )
            
            # Formulate response
            response_text = (
                f"✅ *Maintenance Receipt Extracted!*\n\n"
                f"🏪 *Shop:* {extraction.shop_name or 'Unknown'}\n"
                f"📅 *Date:* {extraction.date or 'Unknown'}\n"
                f"🚗 *Odometer:* {f'{extraction.odometer:,}' if extraction.odometer else 'Unknown'}\n"
                f"💰 *Total Cost:* ₱{f'{extraction.total_cost:,.2f}' if extraction.total_cost else '0.00'}\n\n"
                f"🛠️ *Services:* \n{extraction.services or 'None'}\n\n"
                f"🧠 *Reasoning Log:* \n_{extraction.reasoning_log}_"
            )
        else:
            # Extract as Fuel Receipt
            extraction = client.chat.completions.create(
                model="gpt-4o",
                response_model=FuelReceiptExtraction,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Extract fuel receipt data. Be extremely accurate."},
                            {"type": "image_url", "image_url": {"url": image_data_url}},
                        ],
                    }
                ],
            )
            
            # Formulate response
            response_text = (
                f"✅ *Fuel Receipt Extracted!*\n\n"
                f"⛽ *Station:* {extraction.shop_name or 'Unknown'}\n"
                f"📅 *Date:* {extraction.date or 'Unknown'}\n"
                f"🚗 *Odometer:* {f'{extraction.odometer:,}' if extraction.odometer else 'Unknown'}\n"
                f"💧 *Liters:* {f'{extraction.fuel_liters:.2f} L' if extraction.fuel_liters else 'Unknown'}\n"
                f"💰 *Total Cost:* ₱{f'{extraction.cost:,.2f}' if extraction.cost else '0.00'}\n\n"
                f"🧠 *Reasoning Log:* \n_{extraction.reasoning_log}_"
            )
            
        send_telegram_message(response_text)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        send_telegram_message(f"❌ An error occurred during receipt extraction: {str(e)}")

@app.post("/webhook")
@app.post("/telegram-webhook")
async def telegram_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_telegram_bot_api_secret_token: str = Header(None)
):
    if TELEGRAM_SECRET and x_telegram_bot_api_secret_token != TELEGRAM_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized webhook secret")
        
    payload = await request.json()
    background_tasks.add_task(process_telegram_webhook, payload)
    
    # Return 200 OK instantly to Telegram to prevent timeouts
    return {"status": "ok"}

@app.post("/api/vision/extract-fuel", response_model=FuelReceiptExtraction)
async def extract_fuel_receipt(operator_id: str, image_url: str):
    # Gatekeeper: Verify DB limits before OpenAI routing
    response = supabase.table("operator_profiles").select("subscription_tier").eq("id", operator_id).execute()
    if not response.data:
        raise HTTPException(status_code=403, detail="Operator not found")
        
    tier = response.data[0].get("subscription_tier")
    if tier not in ["PRO", "FREE_TRIAL"]:
        raise HTTPException(status_code=402, detail="Subscription expired or limits reached")
        
    # Call OpenAI via Instructor with Guardrails
    extraction = client.chat.completions.create(
        model="gpt-4o",
        response_model=FuelReceiptExtraction,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Extract fuel receipt data."},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            }
        ],
    )
    return extraction

@app.post("/api/vision/extract-maintenance", response_model=MaintenanceReceiptExtraction)
async def extract_maintenance_receipt(operator_id: str, image_url: str):
    # Gatekeeper: Verify DB limits before OpenAI routing
    response = supabase.table("operator_profiles").select("subscription_tier").eq("id", operator_id).execute()
    if not response.data:
        raise HTTPException(status_code=403, detail="Operator not found")
        
    tier = response.data[0].get("subscription_tier")
    if tier not in ["PRO", "FREE_TRIAL"]:
        raise HTTPException(status_code=402, detail="Subscription expired or limits reached")
        
    # Call OpenAI via Instructor with Guardrails
    extraction = client.chat.completions.create(
        model="gpt-4o",
        response_model=MaintenanceReceiptExtraction,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Extract maintenance receipt data."},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            }
        ],
    )
    return extraction
