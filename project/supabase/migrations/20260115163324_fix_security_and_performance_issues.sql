/*
  # Fix Security and Performance Issues

  ## Changes Made

  ### 1. Add Missing Foreign Key Indexes
  Adds indexes for all foreign key columns to improve query performance:
  - claims: agent_id, client_id, policy_id
  - clients: referred_by_agent_id
  - commissions: agent_id, client_id, policy_id
  - documents: uploaded_by
  - notifications: created_by, recipient_id
  - payment_methods: rep_id
  - policies: agent_id, client_id
  - referrals: rep_id
  - support_tickets: rep_id
  - withdrawal_requests: processed_by, rep_id

  ### 2. Optimize RLS Policies
  Replaces `auth.uid()` with `(select auth.uid())` to prevent re-evaluation for each row:
  - agents: Users can view/update own profile
  - referrals: Reps can view own referrals
  - support_tickets: Reps can view own tickets
  - notifications: Users can view own notifications
  - payment_methods: Reps can view/update own payment methods
  - withdrawal_requests: Reps can view own withdrawal requests

  ### 3. Consolidate Multiple Permissive Policies
  Combines multiple SELECT and UPDATE policies on agents table into single policies

  ### 4. Fix Function Search Paths
  Sets immutable search_path for security functions to prevent injection attacks
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

-- Claims table indexes
CREATE INDEX IF NOT EXISTS idx_claims_agent_id ON claims(agent_id);
CREATE INDEX IF NOT EXISTS idx_claims_client_id ON claims(client_id);
CREATE INDEX IF NOT EXISTS idx_claims_policy_id ON claims(policy_id);

-- Clients table indexes
CREATE INDEX IF NOT EXISTS idx_clients_referred_by_agent_id ON clients(referred_by_agent_id);

-- Commissions table indexes
CREATE INDEX IF NOT EXISTS idx_commissions_agent_id ON commissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_commissions_client_id ON commissions(client_id);
CREATE INDEX IF NOT EXISTS idx_commissions_policy_id ON commissions(policy_id);

-- Documents table indexes
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_created_by ON notifications(created_by);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);

-- Payment methods table indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_rep_id ON payment_methods(rep_id);

-- Policies table indexes
CREATE INDEX IF NOT EXISTS idx_policies_agent_id ON policies(agent_id);
CREATE INDEX IF NOT EXISTS idx_policies_client_id ON policies(client_id);

-- Referrals table indexes
CREATE INDEX IF NOT EXISTS idx_referrals_rep_id ON referrals(rep_id);

-- Support tickets table indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_rep_id ON support_tickets(rep_id);

-- Withdrawal requests table indexes
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_processed_by ON withdrawal_requests(processed_by);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_rep_id ON withdrawal_requests(rep_id);

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES - AGENTS TABLE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON agents;
DROP POLICY IF EXISTS "Admins can view all profiles" ON agents;
DROP POLICY IF EXISTS "Users can update own profile" ON agents;
DROP POLICY IF EXISTS "Admins can update any profile" ON agents;

-- Create optimized consolidated policies
CREATE POLICY "Users can view profiles"
  ON agents
  FOR SELECT
  TO authenticated
  USING (
    id = (select auth.uid()) 
    OR 
    (select raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Users can update profiles"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (
    id = (select auth.uid())
    OR
    (select raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    id = (select auth.uid())
    OR
    (select raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- =====================================================
-- 3. OPTIMIZE RLS POLICIES - REFERRALS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Reps can view own referrals or admins see all" ON referrals;

CREATE POLICY "Reps can view referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (
    rep_id = (select auth.uid())
    OR
    (select raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- =====================================================
-- 4. OPTIMIZE RLS POLICIES - SUPPORT TICKETS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Reps can view own tickets or admins see all" ON support_tickets;

CREATE POLICY "Reps can view tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (
    rep_id = (select auth.uid())
    OR
    (select raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- =====================================================
-- 5. OPTIMIZE RLS POLICIES - NOTIFICATIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own notifications or broadcasts or admins see al" ON notifications;

CREATE POLICY "Users can view notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    recipient_id = (select auth.uid())
    OR
    recipient_id IS NULL
    OR
    (select raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- =====================================================
-- 6. OPTIMIZE RLS POLICIES - PAYMENT METHODS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Reps can view own payment methods or admins see all" ON payment_methods;
DROP POLICY IF EXISTS "Reps can update own payment methods or admins update any" ON payment_methods;

CREATE POLICY "Reps can view payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (
    rep_id = (select auth.uid())
    OR
    (select raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Reps can update payment methods"
  ON payment_methods
  FOR UPDATE
  TO authenticated
  USING (
    rep_id = (select auth.uid())
    OR
    (select raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    rep_id = (select auth.uid())
    OR
    (select raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- =====================================================
-- 7. OPTIMIZE RLS POLICIES - WITHDRAWAL REQUESTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Reps can view own withdrawal requests or admins see all" ON withdrawal_requests;

CREATE POLICY "Reps can view withdrawal requests"
  ON withdrawal_requests
  FOR SELECT
  TO authenticated
  USING (
    rep_id = (select auth.uid())
    OR
    (select raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- =====================================================
-- 8. FIX FUNCTION SEARCH PATHS
-- =====================================================

-- Recreate is_admin_safe with secure search_path
CREATE OR REPLACE FUNCTION is_admin_safe()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
BEGIN
  RETURN (
    SELECT raw_app_meta_data->>'role' = 'admin'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$;

-- Recreate is_manager_or_admin_safe with secure search_path
CREATE OR REPLACE FUNCTION is_manager_or_admin_safe()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
STABLE
AS $$
BEGIN
  RETURN (
    SELECT raw_app_meta_data->>'role' IN ('admin', 'manager')
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$;

-- Recreate handle_new_user with secure search_path
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  user_role text;
  user_name text;
BEGIN
  user_role := COALESCE(new.raw_app_meta_data->>'role', 'agent');
  user_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  INSERT INTO public.agents (
    id,
    email,
    full_name,
    role,
    is_active
  ) VALUES (
    new.id,
    new.email,
    user_name,
    user_role,
    true
  );

  RETURN new;
END;
$$;