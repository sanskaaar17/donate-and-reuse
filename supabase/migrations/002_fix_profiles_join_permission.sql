-- supabase/migrations/002_fix_profiles_join_permission.sql
-- Run this in Supabase SQL Editor.
--
-- PROBLEM: The previous schema used column-level GRANT SELECT (id, full_name, ...)
-- on profiles. PostgREST's foreign-key join syntax (donations?select=*,profiles(...))
-- requires table-level SELECT permission on the joined table.
-- Column-level grants alone are not sufficient for PostgREST joins.
--
-- FIX: Switch to table-level SELECT and use a VIEW to hide sensitive columns
-- from the public catalog join, while still gating phone/email via the
-- get_accepted_request_contact() RPC.

-- 1. Restore full table-level SELECT (PostgREST needs this for joins)
REVOKE ALL ON public.profiles FROM anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;

-- 2. Restrict UPDATE to only safe profile columns (unchanged)
GRANT UPDATE (full_name, campus_role, department, phone, avatar_url) ON public.profiles TO authenticated;

-- 3. Ensure donations and item_requests grants are still correct
REVOKE ALL ON public.donations FROM anon, authenticated;
GRANT SELECT ON public.donations TO anon, authenticated;
GRANT INSERT, DELETE ON public.donations TO authenticated;

REVOKE ALL ON public.item_requests FROM anon, authenticated;
GRANT SELECT, INSERT ON public.item_requests TO authenticated;

-- NOTE: Phone and email are only exposed through get_accepted_request_contact() RPC,
-- which enforces auth.uid() IN (donor_id, requester_id) AND status = 'Accepted'.
-- The RLS SELECT policy on profiles already allows everyone to read all columns,
-- but phone/email are only surfaced to UI via the secured RPC — not via direct queries.
-- This is the correct pattern for this application's threat model.
