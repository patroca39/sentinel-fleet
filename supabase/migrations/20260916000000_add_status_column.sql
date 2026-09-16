-- Add status column to public.logs and public.maintenance_logs to support zero-typing verification loop
ALTER TABLE public.logs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_verification';
ALTER TABLE public.maintenance_logs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_verification';
