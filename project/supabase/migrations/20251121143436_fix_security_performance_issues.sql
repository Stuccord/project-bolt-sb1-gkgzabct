/*
  # Fix Security and Performance Issues

  ## Changes Made

  ### 1. Add Missing Foreign Key Indexes
  - Add indexes for unindexed foreign keys to improve query performance
  - Tables: claims, commissions, documents, notifications, withdrawal_requests

  ### 2. Optimize RLS Policies
  - Fix auth function calls by wrapping with (SELECT auth.uid())
  - Prevents re-evaluation for each row, improving performance at scale
  - Affects: referrals, documents, support_tickets, notifications, payment_methods, withdrawal_requests

  ### 3. Fix Function Search Paths
  - Add SECURITY DEFINER and explicit search_path to all functions
  - Prevents search_path injection attacks

  ### 4. Resolve Multiple Permissive Policies
  - Consolidate overlapping policies for documents and payment_methods

  ## Security Notes
  - All changes maintain existing access control
  - Performance improvements for large-scale operations
  - Protects against search_path injection vulnerabilities
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_claims_client_id ON claims(client_id);
CREATE INDEX IF NOT EXISTS idx_commissions_client_id ON commissions(client_id);
CREATE INDEX IF NOT EXISTS idx_commissions_policy_id ON commissions(policy_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_notifications_created_by ON notifications(created_by);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_processed_by ON withdrawal_requests(processed_by);

-- ============================================================================
-- 2. FIX RLS POLICIES - OPTIMIZE AUTH FUNCTION CALLS
-- ============================================================================

-- REFERRALS TABLE POLICIES
DROP POLICY IF EXISTS "Reps can view own referrals" ON referrals;
CREATE POLICY "Reps can view own referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (
    rep_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM agents WHERE agents.id = (SELECT auth.uid()) AND agents.role IN ('admin', 'manager'))
  );

DROP POLICY IF EXISTS "Reps can create referrals" ON referrals;
CREATE POLICY "Reps can create referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Only admins can update referrals" ON referrals;
CREATE POLICY "Only admins can update referrals"
  ON referrals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = (SELECT auth.uid()) AND agents.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = (SELECT auth.uid()) AND agents.role = 'admin')
  );

-- DOCUMENTS TABLE POLICIES - CONSOLIDATE MULTIPLE PERMISSIVE POLICIES
DROP POLICY IF EXISTS "All authenticated users can view public documents" ON documents;
DROP POLICY IF EXISTS "Admins can manage documents" ON documents;

CREATE POLICY "Users can view documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    is_public = true OR
    EXISTS (SELECT 1 FROM agents WHERE agents.id = (SELECT auth.uid()) AND agents.role = 'admin')
  );

CREATE POLICY "Admins can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = (SELECT auth.uid()) AND agents.role = 'admin')
  );

CREATE POLICY "Admins can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = (SELECT auth.uid()) AND agents.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = (SELECT auth.uid()) AND agents.role = 'admin')
  );

CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = (SELECT auth.uid()) AND agents.role = 'admin')
  );

-- SUPPORT TICKETS TABLE POLICIES
DROP POLICY IF EXISTS "Reps can view own tickets" ON support_tickets;
CREATE POLICY "Reps can view own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (
    rep_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM agents WHERE agents.id = (SELECT auth.uid()) AND agents.role IN ('admin', 'manager'))
  );

DROP POLICY IF EXISTS "Reps can create support tickets" ON support_tickets;
CREATE POLICY "Reps can create support tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins can update support tickets" ON support_tickets;
CREATE POLICY "Admins can update support tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = (SELECT auth.uid()) AND agents.role IN ('admin', 'manager'))
  );

-- NOTIFICATIONS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view own notifications and broadcasts" ON notifications;
CREATE POLICY "Users can view own notifications and broadcasts"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    recipient_id = (SELECT auth.uid()) OR
    recipient_id IS NULL OR
    EXISTS (SELECT 1 FROM agents WHERE agents.id = (SELECT auth.uid()) AND agents.role IN ('admin', 'manager'))
  );

DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;
CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = (SELECT auth.uid()) AND agents.role = 'admin')
  );

DROP POLICY IF EXISTS "Users can mark own notifications as read" ON notifications;
CREATE POLICY "Users can mark own notifications as read"
  ON notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = (SELECT auth.uid()))
  WITH CHECK (recipient_id = (SELECT auth.uid()));

-- PAYMENT METHODS TABLE POLICIES - CONSOLIDATE MULTIPLE PERMISSIVE POLICIES
DROP POLICY IF EXISTS "Reps can view own payment methods" ON payment_methods;
CREATE POLICY "Reps can view own payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (
    rep_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM agents WHERE agents.id = (SELECT auth.uid()) AND agents.role IN ('admin', 'manager'))
  );

DROP POLICY IF EXISTS "Reps can create own payment methods" ON payment_methods;
CREATE POLICY "Reps can create own payment methods"
  ON payment_methods FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Reps can update own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Admins can verify payment methods" ON payment_methods;

CREATE POLICY "Users can update payment methods"
  ON payment_methods FOR UPDATE
  TO authenticated
  USING (
    rep_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM agents WHERE agents.id = (SELECT auth.uid()) AND agents.role = 'admin')
  )
  WITH CHECK (
    rep_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM agents WHERE agents.id = (SELECT auth.uid()) AND agents.role = 'admin')
  );

DROP POLICY IF EXISTS "Reps can delete own payment methods" ON payment_methods;
CREATE POLICY "Reps can delete own payment methods"
  ON payment_methods FOR DELETE
  TO authenticated
  USING (rep_id = (SELECT auth.uid()));

-- WITHDRAWAL REQUESTS TABLE POLICIES
DROP POLICY IF EXISTS "Reps can view own withdrawal requests" ON withdrawal_requests;
CREATE POLICY "Reps can view own withdrawal requests"
  ON withdrawal_requests FOR SELECT
  TO authenticated
  USING (
    rep_id = (SELECT auth.uid()) OR
    EXISTS (SELECT 1 FROM agents WHERE agents.id = (SELECT auth.uid()) AND agents.role IN ('admin', 'manager'))
  );

DROP POLICY IF EXISTS "Reps can create withdrawal requests" ON withdrawal_requests;
CREATE POLICY "Reps can create withdrawal requests"
  ON withdrawal_requests FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins can update withdrawal requests" ON withdrawal_requests;
CREATE POLICY "Admins can update withdrawal requests"
  ON withdrawal_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = (SELECT auth.uid()) AND agents.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = (SELECT auth.uid()) AND agents.role = 'admin')
  );

-- ============================================================================
-- 3. FIX FUNCTION SEARCH PATHS - ADD SECURITY DEFINER
-- ============================================================================

-- Fix generate_case_number function
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  year_part text;
  sequence_num int;
  case_num text;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO sequence_num FROM referrals WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  case_num := 'BG-' || year_part || '-' || LPAD(sequence_num::text, 4, '0');
  RETURN case_num;
END;
$$;

-- Fix generate_ticket_number function
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  year_part text;
  sequence_num int;
  ticket_num text;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO sequence_num FROM support_tickets WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  ticket_num := 'TKT-' || year_part || '-' || LPAD(sequence_num::text, 4, '0');
  RETURN ticket_num;
END;
$$;

-- Fix set_case_number function
CREATE OR REPLACE FUNCTION set_case_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.case_number IS NULL OR NEW.case_number = '' THEN
    NEW.case_number := generate_case_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Fix set_ticket_number function
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Fix update_updated_at function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Fix set_flat_commission function
CREATE OR REPLACE FUNCTION set_flat_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status = 'paid' THEN
    NEW.commission_amount := 200.00;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix generate_withdrawal_number function
CREATE OR REPLACE FUNCTION generate_withdrawal_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  year_part text;
  sequence_num int;
  withdrawal_num text;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO sequence_num 
  FROM withdrawal_requests 
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  withdrawal_num := 'WD-' || year_part || '-' || LPAD(sequence_num::text, 4, '0');
  RETURN withdrawal_num;
END;
$$;

-- Fix set_withdrawal_number function
CREATE OR REPLACE FUNCTION set_withdrawal_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
    NEW.request_number := generate_withdrawal_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Fix update_withdrawal_timestamp function
CREATE OR REPLACE FUNCTION update_withdrawal_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Fix ensure_single_default_payment_method function
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE payment_methods
    SET is_default = false
    WHERE rep_id = NEW.rep_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.agents (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent')
  );
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 4. ADD HELPFUL COMMENTS
-- ============================================================================

COMMENT ON INDEX idx_claims_client_id IS 'Performance: Index for foreign key lookups';
COMMENT ON INDEX idx_commissions_client_id IS 'Performance: Index for foreign key lookups';
COMMENT ON INDEX idx_commissions_policy_id IS 'Performance: Index for foreign key lookups';
COMMENT ON INDEX idx_documents_uploaded_by IS 'Performance: Index for foreign key lookups';
COMMENT ON INDEX idx_notifications_created_by IS 'Performance: Index for foreign key lookups';
COMMENT ON INDEX idx_withdrawal_requests_processed_by IS 'Performance: Index for foreign key lookups';
