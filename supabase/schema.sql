-- Donate & Reuse: run once in Supabase SQL Editor for a new project.
-- The browser must only use the project's publishable/anon key. Never expose a service key.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) BETWEEN 2 AND 100),
  campus_role TEXT NOT NULL DEFAULT 'Engineering Student',
  department TEXT NOT NULL DEFAULT 'Engineering',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, campus_role, department, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''), split_part(NEW.email, '@', 1)),
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'campus_role'), ''), 'Engineering Student'),
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'department'), ''), 'Engineering'),
    NULLIF(trim(NEW.raw_user_meta_data->>'phone'), '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, email, full_name, campus_role, department, phone)
SELECT
  u.id,
  u.email,
  COALESCE(NULLIF(trim(u.raw_user_meta_data->>'full_name'), ''), split_part(u.email, '@', 1)),
  COALESCE(NULLIF(trim(u.raw_user_meta_data->>'campus_role'), ''), 'Engineering Student'),
  COALESCE(NULLIF(trim(u.raw_user_meta_data->>'department'), ''), 'Engineering'),
  NULLIF(trim(u.raw_user_meta_data->>'phone'), '')
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 3 AND 120),
  description TEXT NOT NULL CHECK (char_length(trim(description)) BETWEEN 10 AND 3000),
  category TEXT NOT NULL CHECK (category IN (
    'College Essentials', 'Books', 'Clothes', 'Stationery', 'Electronics', 'Household', 'Other'
  )),
  subcategory TEXT NOT NULL DEFAULT 'General',
  condition TEXT NOT NULL CHECK (condition IN (
    'Brand New', 'Like New', 'Gently Used', 'Functional / Fair'
  )),
  location TEXT NOT NULL CHECK (char_length(trim(location)) BETWEEN 2 AND 200),
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN (
    'Available', 'Reserved', 'Completed', 'Cancelled'
  )),
  image_url TEXT,
  pickup_times TEXT NOT NULL DEFAULT 'Flexible on campus',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT donations_college_subcategory_check CHECK (
    (category = 'College Essentials' AND subcategory IN (
      'Textbooks & Reference Books',
      'Notes & Previous-Year Papers',
      'Lab Coats & Lab Supplies',
      'Scientific Calculators & Drawing Instruments',
      'Engineering Project Materials',
      'Stationery & Record Books',
      'Bags & College Accessories',
      'Other College Items'
    ))
    OR (category <> 'College Essentials' AND subcategory = 'General')
  )
);

CREATE TABLE IF NOT EXISTS public.item_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN (
    'Pending', 'Accepted', 'Declined', 'Cancelled'
  )),
  message TEXT NOT NULL DEFAULT 'I would like to request this item for my coursework.'
    CHECK (char_length(trim(message)) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Also enforce the same bounds when upgrading a database created by the prototype.
ALTER TABLE public.donations
  DROP CONSTRAINT IF EXISTS donations_title_check,
  DROP CONSTRAINT IF EXISTS donations_description_check,
  DROP CONSTRAINT IF EXISTS donations_category_check,
  DROP CONSTRAINT IF EXISTS donations_condition_check,
  DROP CONSTRAINT IF EXISTS donations_location_check,
  DROP CONSTRAINT IF EXISTS donations_status_check,
  DROP CONSTRAINT IF EXISTS donations_college_subcategory_check;
UPDATE public.donations SET subcategory = 'General' WHERE category <> 'College Essentials';
ALTER TABLE public.donations
  ADD CONSTRAINT donations_title_check CHECK (char_length(trim(title)) BETWEEN 3 AND 120),
  ADD CONSTRAINT donations_description_check CHECK (char_length(trim(description)) BETWEEN 10 AND 3000),
  ADD CONSTRAINT donations_category_check CHECK (category IN (
    'College Essentials', 'Books', 'Clothes', 'Stationery', 'Electronics', 'Household', 'Other'
  )),
  ADD CONSTRAINT donations_condition_check CHECK (condition IN (
    'Brand New', 'Like New', 'Gently Used', 'Functional / Fair'
  )),
  ADD CONSTRAINT donations_location_check CHECK (char_length(trim(location)) BETWEEN 2 AND 200),
  ADD CONSTRAINT donations_status_check CHECK (status IN (
    'Available', 'Reserved', 'Completed', 'Cancelled'
  )),
  ADD CONSTRAINT donations_college_subcategory_check CHECK (
    (category = 'College Essentials' AND subcategory IN (
      'Textbooks & Reference Books',
      'Notes & Previous-Year Papers',
      'Lab Coats & Lab Supplies',
      'Scientific Calculators & Drawing Instruments',
      'Engineering Project Materials',
      'Stationery & Record Books',
      'Bags & College Accessories',
      'Other College Items'
    ))
    OR (category <> 'College Essentials' AND subcategory = 'General')
  );

ALTER TABLE public.item_requests
  DROP CONSTRAINT IF EXISTS item_requests_status_check,
  DROP CONSTRAINT IF EXISTS item_requests_message_check;
UPDATE public.item_requests SET message = 'I would like to request this item for my coursework.'
WHERE message IS NULL OR char_length(trim(message)) = 0;
ALTER TABLE public.item_requests
  ALTER COLUMN message SET NOT NULL,
  ADD CONSTRAINT item_requests_status_check CHECK (status IN (
    'Pending', 'Accepted', 'Declined', 'Cancelled'
  )),
  ADD CONSTRAINT item_requests_message_check CHECK (char_length(trim(message)) BETWEEN 1 AND 500);

CREATE INDEX IF NOT EXISTS idx_donations_category ON public.donations(category);
CREATE INDEX IF NOT EXISTS idx_donations_subcategory ON public.donations(subcategory);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_donor_created ON public.donations(donor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_requester_created ON public.item_requests(requester_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_donation ON public.item_requests(donation_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_request_per_user
  ON public.item_requests(donation_id, requester_id)
  WHERE status IN ('Pending', 'Accepted');
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_accepted_request_per_item
  ON public.item_requests(donation_id)
  WHERE status = 'Accepted';

-- Request ownership and item availability are checked in the database using auth.uid(),
-- not a user identity supplied by the browser.
CREATE OR REPLACE FUNCTION public.check_request_eligibility()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_donor_id UUID;
  v_item_status TEXT;
BEGIN
  IF auth.uid() IS NULL OR NEW.requester_id <> auth.uid() OR NEW.status <> 'Pending' THEN
    RAISE EXCEPTION 'Only the authenticated requester can create a pending request';
  END IF;

  SELECT donor_id, status INTO v_donor_id, v_item_status
  FROM public.donations
  WHERE id = NEW.donation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Donation item does not exist';
  END IF;
  IF v_donor_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot request your own donation';
  END IF;
  IF v_item_status <> 'Available' THEN
    RAISE EXCEPTION 'This item is not available for requests';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_request_eligibility ON public.item_requests;
CREATE TRIGGER trg_check_request_eligibility
  BEFORE INSERT ON public.item_requests
  FOR EACH ROW EXECUTE FUNCTION public.check_request_eligibility();

-- Serialize decisions for one donation by locking its row before changing request state.
CREATE OR REPLACE FUNCTION public.accept_item_request(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_donation_id UUID;
  v_donor_id UUID;
  v_item_status TEXT;
  v_request_status TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;

  SELECT donation_id INTO v_donation_id
  FROM public.item_requests WHERE id = p_request_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found');
  END IF;

  SELECT donor_id, status INTO v_donor_id, v_item_status
  FROM public.donations WHERE id = v_donation_id FOR UPDATE;
  IF v_donor_id <> auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only the item owner can accept this request');
  END IF;

  SELECT status INTO v_request_status
  FROM public.item_requests WHERE id = p_request_id FOR UPDATE;
  IF v_request_status <> 'Pending' OR v_item_status <> 'Available' THEN
    RETURN jsonb_build_object('success', false, 'error', 'The request or item is no longer available');
  END IF;

  UPDATE public.item_requests
  SET status = 'Accepted', updated_at = now()
  WHERE id = p_request_id;
  UPDATE public.item_requests
  SET status = 'Declined', updated_at = now()
  WHERE donation_id = v_donation_id AND id <> p_request_id AND status = 'Pending';
  UPDATE public.donations SET status = 'Reserved', updated_at = now()
  WHERE id = v_donation_id;

  RETURN jsonb_build_object('success', true, 'message', 'Request accepted; item reserved');
END;
$$;

CREATE OR REPLACE FUNCTION public.decline_item_request(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_donation_id UUID;
  v_donor_id UUID;
  v_request_status TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;
  SELECT donation_id INTO v_donation_id FROM public.item_requests WHERE id = p_request_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found');
  END IF;
  SELECT donor_id INTO v_donor_id FROM public.donations WHERE id = v_donation_id FOR UPDATE;
  IF v_donor_id <> auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only the item owner can decline this request');
  END IF;
  SELECT status INTO v_request_status FROM public.item_requests WHERE id = p_request_id FOR UPDATE;
  IF v_request_status <> 'Pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only pending requests can be declined');
  END IF;
  UPDATE public.item_requests SET status = 'Declined', updated_at = now() WHERE id = p_request_id;
  RETURN jsonb_build_object('success', true, 'message', 'Request declined');
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_my_item_request(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_donation_id UUID;
  v_requester_id UUID;
  v_request_status TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;
  SELECT donation_id, requester_id INTO v_donation_id, v_requester_id
  FROM public.item_requests WHERE id = p_request_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found');
  END IF;
  PERFORM 1 FROM public.donations WHERE id = v_donation_id FOR UPDATE;
  IF v_requester_id <> auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'You can only cancel your own request');
  END IF;
  SELECT status INTO v_request_status FROM public.item_requests WHERE id = p_request_id FOR UPDATE;
  IF v_request_status <> 'Pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only pending requests can be cancelled');
  END IF;
  UPDATE public.item_requests SET status = 'Cancelled', updated_at = now() WHERE id = p_request_id;
  RETURN jsonb_build_object('success', true, 'message', 'Request cancelled');
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_donation_completed(p_donation_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_donor_id UUID;
  v_status TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;
  SELECT donor_id, status INTO v_donor_id, v_status
  FROM public.donations WHERE id = p_donation_id FOR UPDATE;
  IF NOT FOUND OR v_donor_id <> auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Donation not found or unauthorized');
  END IF;
  IF v_status <> 'Reserved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only a reserved donation can be completed');
  END IF;
  UPDATE public.donations SET status = 'Completed', updated_at = now() WHERE id = p_donation_id;
  RETURN jsonb_build_object('success', true, 'message', 'Donation marked completed');
END;
$$;

-- Contacts are returned only to the requester/owner of an accepted request.
CREATE OR REPLACE FUNCTION public.get_accepted_request_contact(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'donor', jsonb_build_object('email', donor.email, 'phone', donor.phone),
    'requester', jsonb_build_object('email', requester.email, 'phone', requester.phone)
  ) INTO v_result
  FROM public.item_requests r
  JOIN public.donations d ON d.id = r.donation_id
  JOIN public.profiles donor ON donor.id = d.donor_id
  JOIN public.profiles requester ON requester.id = r.requester_id
  WHERE r.id = p_request_id
    AND r.status = 'Accepted'
    AND auth.uid() IN (d.donor_id, r.requester_id);
  RETURN COALESCE(v_result, '{}'::JSONB);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(to_jsonb(p), '{}'::JSONB)
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profile names are readable" ON public.profiles;
DROP POLICY IF EXISTS "Users update their own profile" ON public.profiles;
CREATE POLICY "Public profile names are readable" ON public.profiles
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Donations are viewable by everyone" ON public.donations;
DROP POLICY IF EXISTS "Authenticated users can create donations" ON public.donations;
DROP POLICY IF EXISTS "Donors can update their own donations" ON public.donations;
DROP POLICY IF EXISTS "Donors can delete their own donations" ON public.donations;
DROP POLICY IF EXISTS "Donations are publicly readable" ON public.donations;
DROP POLICY IF EXISTS "Authenticated users create own donations" ON public.donations;
DROP POLICY IF EXISTS "Donors delete their own donations" ON public.donations;
CREATE POLICY "Donations are publicly readable" ON public.donations
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users create own donations" ON public.donations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = donor_id AND status = 'Available');
CREATE POLICY "Donors delete their own donations" ON public.donations
  FOR DELETE TO authenticated USING (auth.uid() = donor_id);

DROP POLICY IF EXISTS "Users can view requests for their items or made by them" ON public.item_requests;
DROP POLICY IF EXISTS "Authenticated users can create requests" ON public.item_requests;
DROP POLICY IF EXISTS "Requesters or item donors can update requests" ON public.item_requests;
DROP POLICY IF EXISTS "Requesters and item owners read related requests" ON public.item_requests;
DROP POLICY IF EXISTS "Users create their own pending requests" ON public.item_requests;
CREATE POLICY "Requesters and item owners read related requests" ON public.item_requests
  FOR SELECT TO authenticated USING (
    auth.uid() = requester_id OR EXISTS (
      SELECT 1 FROM public.donations d WHERE d.id = donation_id AND d.donor_id = auth.uid()
    )
  );
CREATE POLICY "Users create their own pending requests" ON public.item_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id AND status = 'Pending');

-- Restrict profile columns so public name lookup never exposes email or phone.
REVOKE ALL ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, full_name, campus_role, department) ON public.profiles TO anon, authenticated;
GRANT UPDATE (full_name, campus_role, department, phone, avatar_url) ON public.profiles TO authenticated;
REVOKE ALL ON public.donations FROM anon, authenticated;
GRANT SELECT ON public.donations TO anon, authenticated;
GRANT INSERT, DELETE ON public.donations TO authenticated;
REVOKE ALL ON public.item_requests FROM anon, authenticated;
GRANT SELECT, INSERT ON public.item_requests TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_item_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decline_item_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_my_item_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_donation_completed(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_accepted_request_contact(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.accept_item_request(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.decline_item_request(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.cancel_my_item_request(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.mark_donation_completed(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_accepted_request_contact(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_profile() FROM PUBLIC, anon;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('donation-images', 'donation-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view donation images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload donation images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own donation images" ON storage.objects;
DROP POLICY IF EXISTS "Users upload images to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users update images in their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users delete images in their own folder" ON storage.objects;
CREATE POLICY "Public can view donation images" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'donation-images');
CREATE POLICY "Users upload images to their own folder" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'donation-images' AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );
CREATE POLICY "Users update images in their own folder" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'donation-images' AND (storage.foldername(name))[1] = auth.uid()::TEXT
  ) WITH CHECK (
    bucket_id = 'donation-images' AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );
CREATE POLICY "Users delete images in their own folder" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'donation-images' AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );
