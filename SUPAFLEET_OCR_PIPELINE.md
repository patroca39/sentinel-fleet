# SupaFleet Optical OCR Pipeline: Design & Audit Report

## 1. High-Level Architectural Audit & Flow

The pipeline is designed as a frictionless, highly-available webhook listener that applies strict economic and security boundaries before any token-heavy operations occur.

### Execution Flow:
1. **Ingestion:** A driver sends an image of a receipt via Telegram. The Telegram Webhook triggers the workflow.
2. **Download & Hash:** The image is downloaded via an HTTP node. A SHA-256 hash is immediately calculated on the binary data.
3. **Pre-flight Gatekeeper 1 (Identity & Status):** A Supabase query matches the Telegram ID to a `driver_id` and checks `is_active`. If inactive or not found, the pipeline halts.
4. **Pre-flight Gatekeeper 2 (Quota & Limits):** Using the `operator_id` from the driver, the pipeline checks `operator_profiles`. If fleet limits or subscription tiers are exceeded, the pipeline halts.
5. **Pre-flight Gatekeeper 3 (Deduplication):** A Supabase query checks `logs` and `maintenance_logs` for `receipt_id = <image_hash>`. If found, it halts (saving API costs on duplicate uploads).
6. **AI OCR Extraction:** A prompt optimized for a Vision Model (e.g., GPT-4o-mini or Gemini Flash) extracts line items, totals, dates, and performs math verification within a hidden `reasoning_log`.
7. **Math & Schema Validation:** A JS Code Node verifies the AI's math, ensuring the sum of extracted line items equals the extracted total.
8. **Secure DB Insertion:** The validated data is inserted into Supabase. The `operator_id` and `driver_id` obtained in step 3 are hardcoded into the insertion payload, guaranteeing multi-tenancy isolation.
9. **Notification:** Success/Failure message sent back to the driver via Telegram.

---

## 2. Pipeline Audit & Economics

### API Economics & Token Savings
- **Early Exit Strategy:** By placing three database lookups (cheap) before the Vision AI call (expensive), we guarantee zero tokens are wasted on unauthorized users, suspended accounts, or duplicate receipt images.
- **Model Selection:** Recommending **GPT-4o-mini** or **Gemini 1.5 Flash**. They offer excellent OCR vision capabilities at a fraction of the cost of their heavier counterparts.
- **Prompt Engineering:** The prompt uses "Regional Grounding" by instructing the model to *only* focus on the bounding boxes containing line items, dates, and totals, ignoring logos, addresses, and fluff.

### Security Boundaries & Multi-tenancy
- **Strict Tenancy:** The AI does *not* determine the `operator_id` or `driver_id`. These are passed directly from the Pre-flight identity check via node references (e.g., `$node["Get Driver"].json.operator_id`).
- **Data Isolation:** The database insert node explicitly sets the `operator_id` to prevent one tenant's driver from accidentally logging expenses to another tenant.

### Edge Cases & Error Handling
- **Duplicate Detection Flaw:** Hashing the image binary prevents identical file uploads. However, if a driver takes *two different pictures* of the *same receipt*, the hashes will differ. 
  - *Recommendation for V2:* Add an additional post-OCR deduplication step checking `odometer + date + total_cost` combinations.
- **Math Hallucinations:** Large language models struggle with arithmetic. We enforce a `reasoning_log` in the JSON schema where the AI must output the numbers and its addition steps. A subsequent Code Node manually re-calculates the line items to verify against the stated total.
- **Blurry Images/Unreadable Text:** The Vision AI is instructed to return `null` for unreadable critical fields (like `total_cost`). The validation node will catch this and send a Telegram message asking the driver to re-take the photo.

---

## 3. Recommended n8n Node Settings

| Node Name | Node Type | Key Configuration | Purpose |
| :--- | :--- | :--- | :--- |
| **Telegram Trigger** | `n8n-nodes-base.telegramTrigger` | Updates: `message` | Listens for incoming photos from drivers. |
| **Download Image** | `n8n-nodes-base.httpRequest` | URL: `{{$json.message.photo.pop().file_id}}` | Fetches the highest resolution binary image. |
| **Crypto Hash** | `n8n-nodes-base.crypto` | Action: Hash, Type: SHA256, Value: `{{$binary.data}}` | Generates duplicate-check hash. |
| **Get Driver** | `n8n-nodes-base.supabase` | Resource: Row, Operation: Get, Table: `drivers`, Column: `telegram_id` | Identifies driver and operator. |
| **Check Active IF** | `n8n-nodes-base.if` | Condition: `{{$json.is_active}} == true` | Halts if driver suspended. |
| **Check Quota IF** | `n8n-nodes-base.if` | Condition: Check `operator_profiles` limits | Halts if operator limits exceeded. |
| **Check Hash IF** | `n8n-nodes-base.if` | Condition: Count query on logs = 0 | Halts if duplicate hash. |
| **Vision API** | `n8n-nodes-base.httpRequest` / `openAi`| Model: `gpt-4o-mini`, System Prompt: (See JSON below) | Extracts data and performs reasoning. |
| **Validate Math** | `n8n-nodes-base.code` | Language: JavaScript | Validates `sum(cost_breakdown) == total_cost` |
| **Insert Log** | `n8n-nodes-base.supabase` | Resource: Row, Operation: Insert, Table: `logs` (or maintenance) | Securely saves to DB using verified `operator_id`. |

---

## 4. Draft n8n JSON Workflow Representation

```json
{
  "name": "SupaFleet Optical OCR Pipeline",
  "nodes": [
    {
      "parameters": {
        "updates": ["message"]
      },
      "id": "1-telegram-trigger",
      "name": "Telegram Trigger",
      "type": "n8n-nodes-base.telegramTrigger",
      "typeVersion": 1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "action": "hash",
        "type": "SHA256",
        "value": "={{$binary.data}}",
        "dataPropertyName": "receipt_hash"
      },
      "id": "2-crypto-hash",
      "name": "Generate Hash",
      "type": "n8n-nodes-base.crypto",
      "typeVersion": 1,
      "position": [200, 0]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT id, operator_id, is_active FROM drivers WHERE telegram_id = '{{$node[\"Telegram Trigger\"].json.message.from.id}}';"
      },
      "id": "3-supabase-driver",
      "name": "Get Driver & Status",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [400, 0]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [{"value1": "={{$json.is_active}}", "value2": true}]
        }
      },
      "id": "4-if-active",
      "name": "Is Active?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [600, 0]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT count(*) FROM logs WHERE receipt_id = '{{$node[\"Generate Hash\"].json.receipt_hash}}';"
      },
      "id": "5-supabase-dedupe",
      "name": "Check Duplicate Hash",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [800, 0]
    },
    {
      "parameters": {
        "conditions": {
          "number": [{"value1": "={{$json.count}}", "operation": "equal", "value2": 0}]
        }
      },
      "id": "6-if-not-duplicate",
      "name": "Is Not Duplicate?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [1000, 0]
    },
    {
      "parameters": {
        "resource": "chat",
        "operation": "create",
        "model": "gpt-4o-mini",
        "messages": [
          {
            "role": "system",
            "content": "You are a precise data extraction bot. Regionally ground your attention to the line items, date, and total. You must output JSON. First, populate a 'reasoning_log' string explaining your math. Then output 'type' ('fuel' or 'maintenance'), 'total_cost', 'odometer', and 'cost_breakdown' array."
          }
        ]
      },
      "id": "7-vision-ocr",
      "name": "OpenAI Vision OCR",
      "type": "n8n-nodes-base.openAi",
      "typeVersion": 1,
      "position": [1200, 0]
    },
    {
      "parameters": {
        "jsCode": "const data = $input.item.json;\nif (data.type === 'maintenance') {\n  const sum = data.cost_breakdown.reduce((acc, item) => acc + item.amount, 0);\n  if (Math.abs(sum - data.total_cost) > 0.01) {\n    throw new Error('Math Validation Failed: Sum of line items does not match total.');\n  }\n}\nreturn data;"
      },
      "id": "8-code-validation",
      "name": "Math Validation",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1400, 0]
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "={{ $json.type === 'fuel' ? 'logs' : 'maintenance_logs' }}",
        "columns": "operator_id, driver_id, total_cost, receipt_id, cost_breakdown",
        "values": "={{$node[\"Get Driver & Status\"].json.operator_id}}, {{$node[\"Get Driver & Status\"].json.id}}, {{$json.total_cost}}, {{$node[\"Generate Hash\"].json.receipt_hash}}, {{$json.cost_breakdown}}"
      },
      "id": "9-supabase-insert",
      "name": "Secure Insert DB",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [1600, 0]
    }
  ]
}
```