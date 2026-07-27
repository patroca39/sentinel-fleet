import requests
import time
import random
import pandas as pd
from datetime import datetime, timedelta
from openai import OpenAI

# 1. System Connections
SUPABASE_URL_LOGS = "https://ggnnmceoquhbgdltactf.supabase.co/rest/v1/logs"
SUPABASE_URL_ALERTS = "https://ggnnmceoquhbgdltactf.supabase.co/rest/v1/alerts"
SUPABASE_KEY = "sb_publishable_kLvOknOB2UjMAqKWkb2J0w_q0VIm59j"
HEADERS = {
    "apikey": SUPABASE_KEY, 
    "Authorization": f"Bearer {SUPABASE_KEY}", 
    "Content-Type": "application/json"
}

client = OpenAI(api_key="your_openai_key")

# 2. The Adversarial Scenarios
scenarios = [
    {"name": "Normal Operation", "vehicle_id": "UNIT-01", "fuel_used": 10.0, "distance": 100},
    {"name": "The Slow Bleed", "vehicle_id": "UNIT-02", "fuel_used": 13.5, "distance": 100}, 
    {"name": "The Sudden Siphon", "vehicle_id": "UNIT-03", "fuel_used": 40.0, "distance": 50},  
    {"name": "Traffic Jam (Idling)", "vehicle_id": "UNIT-04", "fuel_used": 15.0, "distance": 10} 
]

daily_ledger = []
end_time = datetime.now() + timedelta(hours=24)

print(f"[{datetime.now().strftime('%H:%M:%S')}] Initiating 24-Hour SentinelFleet Red Team Protocol...")
print(f"Simulation will conclude at: {end_time.strftime('%Y-%m-%d %H:%M:%S')}\n")

# 3. The 24-Hour Autonomous Loop
while datetime.now() < end_time:
    # Pick a random scenario to inject
    test = random.choice(scenarios)
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[{timestamp}] Injecting Scenario: {test['name']} for {test['vehicle_id']}...")
    
    # Step A: Inject Data (POST)
    payload = {
        "driver_id": "BOT-01",
        "driver_name": "Red Team Simulator",
        "vehicle": test["vehicle_id"], 
        "fuel_liters": test["fuel_used"], 
        "odometer": 20000 + test["distance"] 
    }
    requests.post(SUPABASE_URL_LOGS, headers=HEADERS, json=payload)
    
    # Step B: Let SentinelFleet process the logic
    time.sleep(10) 
    
    # Step C: Read Resulting Data (GET)
    # Query the alerts table specifically for this vehicle from the last 15 seconds
    alert_query = f"?vehicle_id=eq.{test['vehicle_id']}&order=created_at.desc&limit=1"
    response = requests.get(SUPABASE_URL_ALERTS + alert_query, headers=HEADERS)
    alert_data = response.json()
    
    system_triggered_alert = len(alert_data) > 0
    
    # Step D: Log the outcome
    daily_ledger.append({
        "Time": timestamp,
        "Scenario": test['name'],
        "Vehicle": test['vehicle_id'],
        "System Reaction": "Alert Triggered" if system_triggered_alert else "No Alert"
    })
    
    # Step E: Sleep sporadically (Randomly between 15 mins to 120 mins)
    sleep_seconds = random.randint(900, 7200)
    next_run = (datetime.now() + timedelta(seconds=sleep_seconds)).strftime('%H:%M:%S')
    print(f"  -> Injection complete. System Alert: {system_triggered_alert}. Next injection scheduled roughly at {next_run}.\n")
    time.sleep(sleep_seconds)

# 4. End of Day Analytics & AI Judge
print("\n--- 24-HOUR SIMULATION COMPLETE. ANALYZING DATA ---")
df = pd.DataFrame(daily_ledger)

evaluation_prompt = f"""
You are a Senior Fleet Telemetry Engineer. 
I have run a 24-hour stress test on our new SentinelFleet application. Here is the ledger of injected scenarios and how the system reacted:

{df.to_string()}

Analyze the system's performance. 
1. Did it correctly ignore 'Normal Operation'?
2. Did it catch the 'Sudden Siphon' and 'Slow Bleed'? 
3. Identify any false positives or logical failures in our alert thresholds.
Provide a clear, highly technical 1-paragraph engineering audit on how to improve the variance algorithms based on this specific 24-hour dataset.
"""

judge = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": evaluation_prompt}]
)

print("\n--- SENTINELFLEET ENGINEERING AUDIT ---")
print(judge.choices[0].message.content)
print("\n--- RAW DAILY LEDGER ---")
print(df.to_string())