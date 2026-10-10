-- ============================================================================
-- DONATE & REUSE — SUPABASE POSTGRESQL DATABASE SCHEMA (PHASE 2)
-- Engineering Common Engagement Project (CEP)
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked with auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    campus_role TEXT DEFAULT 'Engineering Student',
    department TEXT DEFAULT 'General Engineering',
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic trigger to create profile upon auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, campus_role, department, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'campus_role', 'Engineering Student'),
        COALESCE(NEW.raw_user_meta_data->>'department', 'Engineering'),
        NEW.raw_user_meta_data->>'phone'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. DONATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(trim(title)) >= 3),
    description TEXT NOT NULL CHECK (char_length(trim(description)) >= 10),
    category TEXT NOT NULL CHECK (
        category IN (
            'College Essentials',
            'Books',
            'Clothes',
            'Stationery',
            'Electronics',
            'Household',
            'Other'
        )
    ),
    subcategory TEXT NOT NULL DEFAULT 'General',
    condition TEXT NOT NULL CHECK (
        condition IN (
            'Brand New',
            'Like New',
            'Gently Used',
            'Functional / Fair'
        )
    ),
    location TEXT NOT NULL CHECK (char_length(trim(location)) >= 2),
    status TEXT NOT NULL DEFAULT 'Available' CHECK (
        status IN (
            'Available',
            'Reserved',
            'Completed',
            'Cancelled'
        )
    ),
    image_url TEXT,
    pickup_times TEXT DEFAULT 'Flexible coordination on campus',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast search and category lookups
CREATE INDEX IF NOT EXISTS idx_donations_category ON public.donations(category);
CREATE INDEX IF NOT EXISTS idx_donations_subcategory ON public.donations(subcategory);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON public.donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_created ON public.donations(created_at DESC);

-- ----------------------------------------------------------------------------
-- 3. ITEM REQUESTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.item_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (
        status IN (
            'Pending',
            'Accepted',
            'Declined',
            'Cancelled'
        )
    ),
    message TEXT DEFAULT 'I would like to request this item for my coursework.',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for user request lookups
CREATE INDEX IF NOT EXISTS idx_requests_donation ON public.item_requests(donation_id);
CREATE INDEX IF NOT EXISTS idx_requests_requester ON public.item_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.item_requests(status);

-- Constraint: Prevent duplicate active requests for the same item by the same user
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_request 
ON public.item_requests (donation_id, requester_id) 
WHERE status IN ('Pending', 'Accepted');

-- Constraint: Prevent donor from requesting their own item
CREATE OR REPLACE FUNCTION public.check_request_eligibility()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    item_donor_id UUID;
    item_status TEXT;
BEGIN
    SELECT donor_id, status INTO item_donor_id, item_status
    FROM public.donations
    WHERE id = NEW.donation_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Donation item does not exist';
    END IF;

    IF item_donor_id = NEW.requester_id THEN
        RAISE EXCEPTION 'Self-request prohibited: You cannot request an item that you donated yourself';
    END IF;

    IF item_status != 'Available' THEN
        RAISE EXCEPTION 'Item is currently not available for requests (Status: %)', item_status;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_request_eligibility ON public.item_requests;
CREATE TRIGGER trg_check_request_eligibility
    BEFORE INSERT ON public.item_requests
    FOR EACH ROW EXECUTE FUNCTION public.check_request_eligibility();

-- ----------------------------------------------------------------------------
-- 4. ATOMIC STORED PROCEDURES (Secure Transactions)
-- ----------------------------------------------------------------------------

-- Procedure 1: Atomically Accept Request & Reserve Item
CREATE OR REPLACE FUNCTION public.accept_item_request(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_donation_id UUID;
    v_donor_id UUID;
    v_item_status TEXT;
    v_req_status TEXT;
BEGIN
    -- Verify request exists and fetch details
    SELECT r.donation_id, d.donor_id, d.status, r.status
    INTO v_donation_id, v_donor_id, v_item_status, v_req_status
    FROM public.item_requests r
    JOIN public.donations d ON d.id = r.donation_id
    WHERE r.id = p_request_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request not found');
    END IF;

    -- Verify caller is the donor
    IF v_donor_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only the item donor can accept requests');
    END IF;

    -- Verify item is still available
    IF v_item_status != 'Available' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Item is no longer available (currently ' || v_item_status || ')');
    END IF;

    IF v_req_status != 'Pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'This request is not in Pending status');
    END IF;

    -- Atomically update target request to Accepted
    UPDATE public.item_requests
    SET status = 'Accepted', updated_at = NOW()
    WHERE id = p_request_id;

    -- Decline all other pending requests for this donation item
    UPDATE public.item_requests
    SET status = 'Declined', updated_at = NOW()
    WHERE donation_id = v_donation_id 
      AND id != p_request_id 
      AND status = 'Pending';

    -- Mark donation as Reserved
    UPDATE public.donations
    SET status = 'Reserved', updated_at = NOW()
    WHERE id = v_donation_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Request accepted successfully. Item marked as Reserved.'
    );
END;
$$;

-- Procedure 2: Donor Declines Request
CREATE OR REPLACE FUNCTION public.decline_item_request(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_donor_id UUID;
BEGIN
    SELECT d.donor_id INTO v_donor_id
    FROM public.item_requests r
    JOIN public.donations d ON d.id = r.donation_id
    WHERE r.id = p_request_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request not found');
    END IF;

    IF v_donor_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    UPDATE public.item_requests
    SET status = 'Declined', updated_at = NOW()
    WHERE id = p_request_id;

    RETURN jsonb_build_object('success', true, 'message', 'Request declined');
END;
$$;

-- Procedure 3: Requester Cancels Their Own Request
CREATE OR REPLACE FUNCTION public.cancel_my_item_request(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_requester_id UUID;
    v_donation_id UUID;
    v_prev_status TEXT;
BEGIN
    SELECT requester_id, donation_id, status
    INTO v_requester_id, v_donation_id, v_prev_status
    FROM public.item_requests
    WHERE id = p_request_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request not found');
    END IF;

    IF v_requester_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: You can only cancel your own requests');
    END IF;

    -- Update request status
    UPDATE public.item_requests
    SET status = 'Cancelled', updated_at = NOW()
    WHERE id = p_request_id;

    -- If this request was Accepted, revert donation status back to Available
    IF v_prev_status = 'Accepted' THEN
        UPDATE public.donations
        SET status = 'Available', updated_at = NOW()
        WHERE id = v_donation_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Request cancelled');
END;
$$;

-- Procedure 4: Donor Marks Handover Completed
CREATE OR REPLACE FUNCTION public.mark_donation_completed(p_donation_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.donations
    SET status = 'Completed', updated_at = NOW()
    WHERE id = p_donation_id AND donor_id = auth.uid();

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Donation not found or unauthorized');
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Item marked as Completed');
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- Enable RLS on all user data tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_requests ENABLE ROW LEVEL SECURITY;

-- A) PROFILES POLICIES
-- Anyone can view profiles (needed to see donor name on listing cards)
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

-- Users can only insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- B) DONATIONS POLICIES
-- Anyone can view donations that are active or completed
CREATE POLICY "Donations are viewable by everyone"
    ON public.donations FOR SELECT
    USING (true);

-- Authenticated users can create donations
CREATE POLICY "Authenticated users can create donations"
    ON public.donations FOR INSERT
    WITH CHECK (auth.uid() = donor_id);

-- Donors can only update their own donations
CREATE POLICY "Donors can update their own donations"
    ON public.donations FOR UPDATE
    USING (auth.uid() = donor_id);

-- Donors can only delete their own donations
CREATE POLICY "Donors can delete their own donations"
    ON public.donations FOR DELETE
    USING (auth.uid() = donor_id);

-- C) ITEM REQUESTS POLICIES
-- Users can view requests if they are the requester OR if they are the donor of the item
CREATE POLICY "Users can view requests for their items or made by them"
    ON public.item_requests FOR SELECT
    USING (
        auth.uid() = requester_id
        OR
        donation_id IN (SELECT id FROM public.donations WHERE donor_id = auth.uid())
    );

-- Authenticated users can insert requests (self-request checked by trigger)
CREATE POLICY "Authenticated users can create requests"
    ON public.item_requests FOR INSERT
    WITH CHECK (auth.uid() = requester_id);

-- Requesters can update their own request (e.g. to Cancel)
-- Donors can update requests for their items (e.g. Accept/Decline via RPC or direct)
CREATE POLICY "Requesters or item donors can update requests"
    ON public.item_requests FOR UPDATE
    USING (
        auth.uid() = requester_id
        OR
        donation_id IN (SELECT id FROM public.donations WHERE donor_id = auth.uid())
    );

-- ----------------------------------------------------------------------------
-- 6. SUPABASE STORAGE BUCKET CONFIGURATION
-- ----------------------------------------------------------------------------

-- Create bucket 'donation-images' for optional image uploads if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('donation-images', 'donation-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy 1: Anyone can view donation images
CREATE POLICY "Public can view donation images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'donation-images');

-- Storage Policy 2: Authenticated users can upload donation images
CREATE POLICY "Authenticated users can upload donation images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'donation-images' 
        AND auth.role() = 'authenticated'
    );

-- Storage Policy 3: Users can delete their own uploaded images
CREATE POLICY "Users can delete their own donation images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'donation-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
