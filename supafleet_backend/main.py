import os
import base64
import httpx
from openai import OpenAI
from fastapi import FastAPI, Request, Header, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

# Ensure these match the functions exported in your database.py
from database import get_active_driver, consume_quota

load_dotenv()

# --- AI Architecture (Native OpenAI) ---
raw_client = OpenAI() 

# --- Initialize Rate Limiter & FastAPI ---
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="SupaFleet B2B Backend")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

TELEGRAM_SECRET = os.getenv("TELEGRAM_WEBHOOK_SECRET")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

def verify_telegram_secret(x_telegram_bot_api_secret_token: str = Header(None)):
    """Cryptographic Shield: Instantly drops requests not from your Telegram Bot."""
    if x_telegram_bot_api_secret_token != TELEGRAM_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

# --- Pydantic Schemas (Playbook: Hidden Reasoning Log) ---
class FuelReceiptExtraction(BaseModel):
    reasoning_log: str = Field(description="Hidden compute space to verify totals and math before extracting.")
    vendor_name: str
    total_amount: float
    liters_filled: float
    date: str

class MaintenanceReceiptExtraction(BaseModel):
    reasoning_log: str = Field(description="Hidden compute space to verify totals and math before extracting.")
    vendor_name: str
    total_amount: float
    service_description: str
    date: str

# --- Frictionless Async Worker ---
async def process_telegram_webhook_background(driver_data: dict, file_id: str, chat_id: str):
    """
    Executes heavy image extraction asynchronously so Telegram never hangs.
    """
    try:
        # 1. Download Image from Telegram API
        async with httpx.AsyncClient() as http:
            file_info = await http.get(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getFile?file_id={file_id}")
            file_path = file_info.json()["result"]["file_path"]
            
            img_resp = await http.get(f"https://api.telegram.org/file/bot{TELEGRAM_BOT_TOKEN}/{file_path}")
            base64_image = base64.b64encode(img_resp.content).decode("utf-8")

        # 2. Dual-Engine Fast Classification (Standard completions.create)
        classification_resp = raw_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Is this a fuel/gas receipt, or a vehicle maintenance/parts receipt? Reply ONLY with 'fuel', 'maintenance', or 'unknown'."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                }
            ],
            max_tokens=10
        )
        receipt_type = classification_resp.choices[0].message.content.strip().lower()

        # 3. Dense OCR Extraction (Native Structured Outputs via completions.parse)
        msg_text = ""
        if "fuel" in receipt_type:
            extraction = raw_client.beta.chat.completions.parse(
                model="gpt-4o",
                response_format=FuelReceiptExtraction,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Extract the exact details from this fuel receipt."},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                        ]
                    }
                ]
            )
            data = extraction.choices[0].message.parsed
            msg_text = f"✅ *Fuel Receipt Logged*\nVendor: {data.vendor_name}\nAmount: ₱{data.total_amount}\nLiters: {data.liters_filled}L\nDate: {data.date}"
            # TODO: Call your Supabase insertion RPC here
            
        elif "maintenance" in receipt_type:
            extraction = raw_client.beta.chat.completions.parse(
                model="gpt-4o",
                response_format=MaintenanceReceiptExtraction,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Extract the exact details from this maintenance receipt."},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                        ]
                    }
                ]
            )
            data = extraction.choices[0].message.parsed
            msg_text = f"🔧 *Maintenance Logged*\nVendor: {data.vendor_name}\nAmount: ₱{data.total_amount}\nService: {data.service_description}\nDate: {data.date}"
            # TODO: Call your Supabase insertion RPC here
            
        else:
            msg_text = "⚠️ Could not clearly identify this as a fuel or maintenance receipt. Please ensure the photo is clear."

        # 4. Dispatch the extracted data back to the driver
        async with httpx.AsyncClient() as http:
            await http.post(
                f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
                json={"chat_id": chat_id, "text": msg_text, "parse_mode": "Markdown"}
            )

    except Exception as e:
        print(f"Background AI Error: {str(e)}")
        async with httpx.AsyncClient() as http:
            await http.post(
                f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
                json={"chat_id": chat_id, "text": "❌ An error occurred while processing the receipt. The image might be too blurry."}
            )

# --- Primary Endpoints ---

@app.post("/telegram-webhook", dependencies=[Depends(verify_telegram_secret)])
@limiter.limit("5/minute") # Anti-Spam Burst Limiter
async def telegram_webhook(request: Request, background_tasks: BackgroundTasks):
    payload = await request.json()
    message = payload.get("message", {})
    chat_id = str(message.get("chat", {}).get("id"))
    
    # 1. Reject Albums/Media Groups to protect API economics
    if "media_group_id" in message:
        async with httpx.AsyncClient() as http:
            await http.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage", json={"chat_id": chat_id, "text": "⚠️ Please send single photos only."})
        return {"status": "rejected", "reason": "media_group_not_supported"}

    # 2. Extract single photo file_id
    file_id = None
    if "photo" in message and isinstance(message["photo"], list):
        file_id = message["photo"][-1]["file_id"] # Get highest res photo
    elif "document" in message:
        file_id = message["document"]["file_id"]
        
    if not file_id:
        return {"status": "ignored", "reason": "no_valid_image"}

    # 3. Pre-Flight Gatekeeper: Identify Active Driver
    driver = get_active_driver(chat_id)
    if not driver:
        async with httpx.AsyncClient() as http:
            await http.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage", json={"chat_id": chat_id, "text": "🚫 Unauthorized: Driver profile not found."})
        return {"status": "rejected", "reason": "unauthorized_driver"}

    # 4. Pre-Flight Gatekeeper: Atomic Quota Deduction
    has_quota = consume_quota(driver["operator_id"])
    if not has_quota:
        async with httpx.AsyncClient() as http:
            await http.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage", json={"chat_id": chat_id, "text": "💳 Operator monthly quota exceeded."})
        return {"status": "rejected", "reason": "quota_exceeded"}

    # 5. Offload heavy lifting to background
    background_tasks.add_task(process_telegram_webhook_background, driver, file_id, chat_id)

    # 6. Return 200 OK instantly to Telegram
    return {"status": "processing"}

# --- OpenAPI Spec Routes ---
@app.post("/api/vision/extract-fuel")
async def extract_fuel():
    return {"status": "ok"}

@app.post("/api/vision/extract-maintenance")
async def extract_maintenance():
    return {"status": "ok"}