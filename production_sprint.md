**ROLE:** Lead Auditor (Orchestrator)
**OBJECTIVE:** Execute a full production cutover for the SupaFleet architecture. Sanitize the FastAPI backend for a Linux/cloud environment and generate the enterprise VisActor UI components.

**DELEGATION INSTRUCTIONS:**
You must coordinate the Pipeline Auditor, Database Auditor, and Frontend Auditor to execute the following systemic updates simultaneously.

### 1. BACKEND & PIPELINE SANITIZATION (Assign to Pipeline/DB Auditors)
- **Path Sanitization:** Scour `main.py`, `database.py`, and `bind_webhook.py`. Eradicate all hardcoded local Windows paths (e.g., `C:\Users\...`). Replace them with dynamic absolute paths using `os.path.dirname(os.path.abspath(__file__))`.
- **Production Server Config:** Update the `requirements.txt` to include `gunicorn`. Output the exact production startup command: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000`.
- **Webhook Cutover:** Update `bind_webhook.py` to route traffic strictly to `https://api.supafleethq.com/webhook`. 
- **API Economics & Frictionless UX:** Ensure the `/webhook` endpoint instantly returns `200 OK`. The pipeline MUST execute DB gatekeeper billing checks (RPCs) BEFORE routing image payloads to the OpenAI Vision models in the background.

### 2. ENTERPRISE VISACTOR UI REFACTOR (Assign to Frontend Auditor)
- **Defensive Frontend (CRITICAL):** All React components mapping telemetry data MUST hydrate arrays safely using `Array.isArray()`. Implement graceful degradation (skeleton loaders or "No Data" states) for null or incomplete JSON returns from Supabase. Do not allow fatal crashes.
- **Aesthetic:** Construct a Next.js `page.tsx` using a 4-column CSS grid. Use deep slate backgrounds (`bg-[#0F172A]` canvas, `bg-[#1E293B]` cards). 
- **Gamification/Indicators:** Gamify the raw telemetry into visual indicators using Emerald (`#22C55E` for Excellent/Capable), Amber (`#F59E0B` for Warning), and Rose (`#EF4444` for Alerts).
- **VisActor Implementation:** Generate wrapper components using `@visactor/react-vchart`. Include a `'gauge'` chart for the Fleet CPK Score and a `'line'` chart with an area gradient fill for the Fuel Efficiency Trend (using Cyan `#06B6D4` for high contrast).

**OUTPUT REQUIREMENT:**
Execute the file writes directly to the local file system. Output a high-level summary of all changed files, confirming that the Windows path sanitization and Defensive Frontend array checks were successfully applied.