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
    Extract data, download image, hit OpenAI via Instructor
    """
    message = payload.get("message", {})
    chat_id = message.get("chat", {}).get("id")
    # 1. Identity & Status Check
    # 2. Download Image
    # 3. Deduplication Check (receipt_id = hash)
    # 4. OpenAI Extraction with Guardrails
    pass

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
