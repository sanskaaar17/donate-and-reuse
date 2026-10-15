-- supabase/migrations/001_updated_at_trigger.sql
-- Run this once in the Supabase SQL Editor.
-- Adds an automatic updated_at timestamp trigger to donations and item_requests.
-- The tables already have the updated_at column; this migration just wires up the auto-update.

-- Generic trigger function (reusable across any table)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Donations: auto-update updated_at on any row change
DROP TRIGGER IF EXISTS trg_donations_updated_at ON public.donations;
CREATE TRIGGER trg_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Item requests: auto-update updated_at on any row change
DROP TRIGGER IF EXISTS trg_requests_updated_at ON public.item_requests;
CREATE TRIGGER trg_requests_updated_at
  BEFORE UPDATE ON public.item_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Profiles: auto-update updated_at on any row change
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
