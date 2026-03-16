/*
  # Fix RLS Policies and Signup Trigger

  ## Issues Fixed

  ### 1. Permission Denied Errors
  The RLS policies were querying auth.users table directly, which authenticated users don't have permission to access.
  Solution: Use the agents table role column instead of querying auth.users.

  ### 2. Signup Trigger Issues
  The handle_new_user trigger wasn't properly handling user metadata from signup.
  Solution: Updated to correctly extract data from raw_user_meta_data.

  ## Changes Made

  1. **Update all RLS policies** to check role from agents table instead of auth.users
  2. **Fix handle_new_user trigger** to properly extract signup data
  3. **Optimize policies** for better performance
*/

-- =====================================================
-- 1. FIX AGENTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view profiles" ON agents;
DROP POLICY IF EXISTS "Users can update profiles" ON agents;

-- Users can view their own profile, admins can view all
CREATE POLICY "Users can view own profile"
  ON agents
  FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

-- Separate admin policy for viewing all profiles
CREATE POLICY "Admins can view all profiles"
  ON agents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- =====================================================
-- 2. FIX REFERRALS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Reps can view referrals" ON referrals;

CREATE POLICY "Reps can view own referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (rep_id = (select auth.uid()));

CREATE POLICY "Admins can view all referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- =====================================================
-- 3. FIX SUPPORT TICKETS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Reps can view tickets" ON support_tickets;

CREATE POLICY "Reps can view own tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (rep_id = (select auth.uid()));

CREATE POLICY "Admins can view all tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- =====================================================
-- 4. FIX NOTIFICATIONS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    recipient_id = (select auth.uid())
    OR recipient_id IS NULL
  );

CREATE POLICY "Admins can view all notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- =====================================================
-- 5. FIX PAYMENT METHODS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Reps can view payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Reps can update payment methods" ON payment_methods;

CREATE POLICY "Reps can view own payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (rep_id = (select auth.uid()));

CREATE POLICY "Admins can view all payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

CREATE POLICY "Reps can update own payment methods"
  ON payment_methods
  FOR UPDATE
  TO authenticated
  USING (rep_id = (select auth.uid()))
  WITH CHECK (rep_id = (select auth.uid()));

CREATE POLICY "Admins can update any payment methods"
  ON payment_methods
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- =====================================================
-- 6. FIX WITHDRAWAL REQUESTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Reps can view withdrawal requests" ON withdrawal_requests;

CREATE POLICY "Reps can view own withdrawal requests"
  ON withdrawal_requests
  FOR SELECT
  TO authenticated
  USING (rep_id = (select auth.uid()));

CREATE POLICY "Admins can view all withdrawal requests"
  ON withdrawal_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- =====================================================
-- 7. FIX HANDLE_NEW_USER TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  user_role text;
  user_name text;
  user_phone text;
  user_hospital text;
BEGIN
  -- Extract data from raw_user_meta_data (this is where signup data goes)
  user_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_app_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );
  
  user_phone := COALESCE(
    new.raw_user_meta_data->>'phone',
    new.raw_app_meta_data->>'phone',
    ''
  );
  
  user_hospital := COALESCE(
    new.raw_user_meta_data->>'hospital_affiliation',
    new.raw_app_meta_data->>'hospital_affiliation',
    ''
  );
  
  -- Role defaults to 'agent' for public signups
  user_role := COALESCE(new.raw_app_meta_data->>'role', 'agent');

  -- Insert into agents table
  INSERT INTO public.agents (
    id,
    email,
    full_name,
    phone,
    hospital_affiliation,
    role,
    is_active
  ) VALUES (
    new.id,
    new.email,
    user_name,
    user_phone,
    user_hospital,
    user_role,
    true
  );

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth signup
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;