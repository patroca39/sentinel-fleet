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
from database import (
    get_active_driver,
    consume_quota,
    insert_fuel_receipt,
    insert_maintenance_receipt,
    update_receipt_status,
    get_latest_pending_receipt_id
)

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

# --- Pydantic Schemas ---
class FuelReceiptExtraction(BaseModel):
    reasoning_log: str = Field(description="Hidden compute space to verify totals and math before extracting.")
    vendor_name: str
    total_amount: float
    liters_filled: float
    date: str
    odometer_reading: int = Field(description="The vehicle's dashboard mileage. Return 0 if not visible or illegible.")

class MaintenanceReceiptExtraction(BaseModel):
    reasoning_log: str = Field(description="Hidden compute space to verify totals and math before extracting.")
    vendor_name: str
    total_amount: float
    service_description: str
    date: str
    odometer_reading: int = Field(description="The vehicle's dashboard mileage. Return 0 if not visible or illegible.")

# --- Frictionless Async Worker ---
async def process_telegram_webhook_background(driver_data: dict, file_id: str, chat_id: str):
    """Executes heavy image extraction asynchronously so Telegram never hangs."""
    try:
        # 1. Download Image
        async with httpx.AsyncClient() as http:
            file_info = await http.get(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getFile?file_id={file_id}")
            file_path = file_info.json()["result"]["file_path"]
            
            img_resp = await http.get(f"https://api.telegram.org/file/bot{TELEGRAM_BOT_TOKEN}/{file_path}")
            base64_image = base64.b64encode(img_resp.content).decode("utf-8")

        # 2. Fast Classification
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

        # 3. Dense OCR Extraction
        msg_text = ""
        is_valid_type = False
        
        if "fuel" in receipt_type:
            extraction = raw_client.beta.chat.completions.parse(
                model="gpt-4o",
                response_format=FuelReceiptExtraction,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "You are analyzing a fleet receipt for RozenPasque operating in Region 8, Philippines. Extract the exact details. Look carefully for the odometer reading (usually photographed against the vehicle dashboard). If any number is illegible, return 0 rather than guessing. Do not hallucinate data."},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                        ]
                    }
                ]
            )
            data = extraction.choices[0].message.parsed
            msg_text = f"✅ *Fuel Receipt Logged (Pending)*\nVendor: {data.vendor_name}\nAmount: ₱{data.total_amount}\nLiters: {data.liters_filled}L\nDate: {data.date}\nOdometer: {data.odometer_reading} km"
            is_valid_type = True
            insert_fuel_receipt(driver_data, data, file_id)
            
        elif "maintenance" in receipt_type:
            extraction = raw_client.beta.chat.completions.parse(
                model="gpt-4o",
                response_format=MaintenanceReceiptExtraction,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "You are analyzing a fleet receipt for RozenPasque operating in Region 8, Philippines. Extract the exact details. Look carefully for the odometer reading (usually photographed against the vehicle dashboard). If any number is illegible, return 0 rather than guessing. Do not hallucinate data."},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                        ]
                    }
                ]
            )
            data = extraction.choices[0].message.parsed
            msg_text = f"🔧 *Maintenance Logged (Pending)*\nVendor: {data.vendor_name}\nAmount: ₱{data.total_amount}\nService: {data.service_description}\nDate: {data.date}\nOdometer: {data.odometer_reading} km"
            is_valid_type = True
            insert_maintenance_receipt(driver_data, data, file_id)
            
        else:
            msg_text = "⚠️ Could not clearly identify this as a fuel or maintenance receipt. Please ensure the photo is clear."

        # 4. Dispatch data and buttons
        payload = {
            "chat_id": chat_id,
            "text": msg_text,
            "parse_mode": "Markdown"
        }
        
        if is_valid_type:
            payload["reply_markup"] = {
                "inline_keyboard": [
                    [{"text": "✅ Confirm & Lock Data", "callback_data": "verify_confirm"}],
                    [{"text": "🔄 Redo AI Analysis", "callback_data": "verify_redo"}],
                    [
                        {"text": "📸 Retake Odometer", "callback_data": "verify_retake_odo"},
                        {"text": "🧾 Retake Receipt", "callback_data": "verify_retake_rcpt"}
                    ]
                ]
            }

        async with httpx.AsyncClient() as http:
            await http.post(
                f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
                json=payload
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
@limiter.limit("5/minute")
async def telegram_webhook(request: Request, background_tasks: BackgroundTasks):
    payload = await request.json()
    
    # 1. Intercept Callbacks FIRST
    if "callback_query" in payload:
        callback_query = payload["callback_query"]
        callback_data = callback_query.get("data")
        query_id = callback_query.get("id")
        chat_id = str(callback_query.get("message", {}).get("chat", {}).get("id"))
        message_id = callback_query.get("message", {}).get("message_id")
        
        # Grab the original message text so we don't accidentally delete the receipt details
        original_text = callback_query.get("message", {}).get("text", "Receipt Data")
        clean_text = original_text.replace("(Pending)", "")
        
        # Acknowledge immediately to kill loading spinner
        async with httpx.AsyncClient() as http:
            await http.post(
                f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/answerCallbackQuery",
                json={"callback_query_id": query_id}
            )
            
        # Route logic and edit the message in-place
        if callback_data == "verify_confirm":
            receipt_id = get_latest_pending_receipt_id(chat_id)
            if receipt_id:
                update_receipt_status(receipt_id, "verified")
            
            new_text = f"{clean_text}\n\n✅ *STATUS: VERIFIED & LOCKED*"
            
        elif callback_data == "verify_redo":
            # Just mark it rejected and ask for a new upload
            new_text = f"{clean_text}\n\n❌ *STATUS: REJECTED*\nPlease upload a clearer photo of the receipt to redo the OCR."
            
        elif callback_data in ["verify_retake_odo", "verify_retake_rcpt"]:
            photo_type = "Odometer" if callback_data == "verify_retake_odo" else "Receipt"
            new_text = f"{clean_text}\n\n⏳ *STATUS: AWAITING RETAKE*\nPlease upload a clear photo of the {photo_type}."

        # Execute the UI update (this removes the buttons and applies the new text)
        async with httpx.AsyncClient() as http:
            await http.post(
                f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/editMessageText",
                json={
                    "chat_id": chat_id,
                    "message_id": message_id,
                    "text": new_text,
                    "parse_mode": "Markdown"
                }
            )
            
        return {"status": "callback_processed"}

    # 2. Process Standard Image Messages
    message = payload.get("message", {})
    chat_id = str(message.get("chat", {}).get("id"))
    
    if "media_group_id" in message:
        async with httpx.AsyncClient() as http:
            await http.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage", json={"chat_id": chat_id, "text": "⚠️ Please send single photos only."})
        return {"status": "rejected", "reason": "media_group_not_supported"}

    file_id = None
    if "photo" in message and isinstance(message["photo"], list):
        file_id = message["photo"][-1]["file_id"] 
    elif "document" in message:
        file_id = message["document"]["file_id"]
        
    if not file_id:
        return {"status": "ignored", "reason": "no_valid_image"}

    driver = get_active_driver(chat_id)
    if not driver:
        async with httpx.AsyncClient() as http:
            await http.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage", json={"chat_id": chat_id, "text": "🚫 Unauthorized: Driver profile not found."})
        return {"status": "rejected", "reason": "unauthorized_driver"}

    has_quota = consume_quota(driver.get("operator_id", ""))
    if not has_quota:
        async with httpx.AsyncClient() as http:
            await http.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage", json={"chat_id": chat_id, "text": "💳 Operator monthly quota exceeded."})
        return {"status": "rejected", "reason": "quota_exceeded"}

    background_tasks.add_task(process_telegram_webhook_background, driver, file_id, chat_id)
    return {"status": "processing"}

# --- OpenAPI Spec Routes ---
@app.post("/api/vision/extract-fuel")
async def extract_fuel():
    return {"status": "ok"}

@app.post("/api/vision/extract-maintenance")
async def extract_maintenance():
    return {"status": "ok"}