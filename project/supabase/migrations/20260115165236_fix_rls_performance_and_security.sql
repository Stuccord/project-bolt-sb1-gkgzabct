/*
  # Fix RLS Performance and Security Issues

  ## Critical Security Fixes
  1. Remove all references to user_metadata (user-editable, insecure)
  2. Use only app_metadata for role checks (server-controlled, secure)
  
  ## Performance Optimizations
  1. Wrap all auth.uid() in (SELECT auth.uid()) to prevent re-evaluation per row
  2. Wrap all auth.jwt() in (SELECT auth.jwt()) to prevent re-evaluation per row
  3. Drop unused indexes to improve write performance

  ## Changes
  - Drop all current policies
  - Drop unused indexes
  - Recreate policies with performance and security fixes
*/

-- =====================================================
-- DROP UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_claims_agent_id;
DROP INDEX IF EXISTS idx_claims_client_id;
DROP INDEX IF EXISTS idx_claims_policy_id;
DROP INDEX IF EXISTS idx_clients_referred_by_agent_id;
DROP INDEX IF EXISTS idx_commissions_agent_id;
DROP INDEX IF EXISTS idx_commissions_client_id;
DROP INDEX IF EXISTS idx_commissions_policy_id;
DROP INDEX IF EXISTS idx_documents_uploaded_by;
DROP INDEX IF EXISTS idx_notifications_created_by;
DROP INDEX IF EXISTS idx_notifications_recipient_id;
DROP INDEX IF EXISTS idx_payment_methods_rep_id;
DROP INDEX IF EXISTS idx_policies_agent_id;
DROP INDEX IF EXISTS idx_policies_client_id;
DROP INDEX IF EXISTS idx_referrals_rep_id;
DROP INDEX IF EXISTS idx_support_tickets_rep_id;
DROP INDEX IF EXISTS idx_withdrawal_requests_processed_by;
DROP INDEX IF EXISTS idx_withdrawal_requests_rep_id;

-- =====================================================
-- DROP ALL EXISTING POLICIES
-- =====================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END$$;

-- =====================================================
-- AGENTS TABLE POLICIES
-- =====================================================

CREATE POLICY "Users can view own profile"
  ON agents FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all profiles"
  ON agents FOR SELECT TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

CREATE POLICY "Users can update own profile"
  ON agents FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Admins can update any profile"
  ON agents FOR UPDATE TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  )
  WITH CHECK (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

CREATE POLICY "Users can insert own profile"
  ON agents FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Admins can insert any profile"
  ON agents FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

CREATE POLICY "Admins can delete profiles"
  ON agents FOR DELETE TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

-- =====================================================
-- REFERRALS TABLE POLICIES
-- =====================================================

CREATE POLICY "Reps can view own referrals"
  ON referrals FOR SELECT TO authenticated
  USING (rep_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all referrals"
  ON referrals FOR SELECT TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

CREATE POLICY "Reps can insert own referrals"
  ON referrals FOR INSERT TO authenticated
  WITH CHECK (rep_id = (SELECT auth.uid()));

CREATE POLICY "Reps can update own referrals"
  ON referrals FOR UPDATE TO authenticated
  USING (rep_id = (SELECT auth.uid()))
  WITH CHECK (rep_id = (SELECT auth.uid()));

CREATE POLICY "Admins can update any referral"
  ON referrals FOR UPDATE TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  )
  WITH CHECK (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

-- =====================================================
-- SUPPORT TICKETS TABLE POLICIES
-- =====================================================

CREATE POLICY "Reps can view own tickets"
  ON support_tickets FOR SELECT TO authenticated
  USING (rep_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all tickets"
  ON support_tickets FOR SELECT TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

CREATE POLICY "Reps can insert own tickets"
  ON support_tickets FOR INSERT TO authenticated
  WITH CHECK (rep_id = (SELECT auth.uid()));

CREATE POLICY "Reps can update own tickets"
  ON support_tickets FOR UPDATE TO authenticated
  USING (rep_id = (SELECT auth.uid()))
  WITH CHECK (rep_id = (SELECT auth.uid()));

CREATE POLICY "Admins can update any ticket"
  ON support_tickets FOR UPDATE TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  )
  WITH CHECK (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

-- =====================================================
-- NOTIFICATIONS TABLE POLICIES
-- =====================================================

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (recipient_id = (SELECT auth.uid()) OR recipient_id IS NULL);

CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (recipient_id = (SELECT auth.uid()))
  WITH CHECK (recipient_id = (SELECT auth.uid()));

CREATE POLICY "Admins can update any notification"
  ON notifications FOR UPDATE TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  )
  WITH CHECK (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

-- =====================================================
-- PAYMENT METHODS TABLE POLICIES
-- =====================================================

CREATE POLICY "Reps can view own payment methods"
  ON payment_methods FOR SELECT TO authenticated
  USING (rep_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all payment methods"
  ON payment_methods FOR SELECT TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

CREATE POLICY "Reps can insert own payment methods"
  ON payment_methods FOR INSERT TO authenticated
  WITH CHECK (rep_id = (SELECT auth.uid()));

CREATE POLICY "Reps can update own payment methods"
  ON payment_methods FOR UPDATE TO authenticated
  USING (rep_id = (SELECT auth.uid()))
  WITH CHECK (rep_id = (SELECT auth.uid()));

CREATE POLICY "Admins can update any payment methods"
  ON payment_methods FOR UPDATE TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  )
  WITH CHECK (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

CREATE POLICY "Reps can delete own payment methods"
  ON payment_methods FOR DELETE TO authenticated
  USING (rep_id = (SELECT auth.uid()));

-- =====================================================
-- WITHDRAWAL REQUESTS TABLE POLICIES
-- =====================================================

CREATE POLICY "Reps can view own withdrawal requests"
  ON withdrawal_requests FOR SELECT TO authenticated
  USING (rep_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all withdrawal requests"
  ON withdrawal_requests FOR SELECT TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

CREATE POLICY "Reps can insert own withdrawal requests"
  ON withdrawal_requests FOR INSERT TO authenticated
  WITH CHECK (rep_id = (SELECT auth.uid()));

CREATE POLICY "Reps can update own withdrawal requests"
  ON withdrawal_requests FOR UPDATE TO authenticated
  USING (rep_id = (SELECT auth.uid()))
  WITH CHECK (rep_id = (SELECT auth.uid()));

CREATE POLICY "Admins can update any withdrawal request"
  ON withdrawal_requests FOR UPDATE TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  )
  WITH CHECK (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

-- =====================================================
-- APPOINTMENTS TABLE POLICIES
-- =====================================================

CREATE POLICY "Anyone can insert appointments"
  ON appointments FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all appointments"
  ON appointments FOR SELECT TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

CREATE POLICY "Admins can update appointments"
  ON appointments FOR UPDATE TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  )
  WITH CHECK (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

-- =====================================================
-- CLIENTS TABLE POLICIES
-- =====================================================

CREATE POLICY "View own clients"
  ON clients FOR SELECT TO authenticated
  USING (
    referred_by_agent_id = (SELECT auth.uid())
    OR (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'manager')
  );

CREATE POLICY "Insert own clients"
  ON clients FOR INSERT TO authenticated
  WITH CHECK (referred_by_agent_id = (SELECT auth.uid()));

CREATE POLICY "Update own clients"
  ON clients FOR UPDATE TO authenticated
  USING (
    referred_by_agent_id = (SELECT auth.uid())
    OR (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'manager')
  )
  WITH CHECK (
    referred_by_agent_id = (SELECT auth.uid())
    OR (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'manager')
  );

-- =====================================================
-- POLICIES TABLE POLICIES
-- =====================================================

CREATE POLICY "View own policies"
  ON policies FOR SELECT TO authenticated
  USING (
    agent_id = (SELECT auth.uid())
    OR (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'manager')
  );

CREATE POLICY "Insert own policies"
  ON policies FOR INSERT TO authenticated
  WITH CHECK (agent_id = (SELECT auth.uid()));

CREATE POLICY "Update own policies"
  ON policies FOR UPDATE TO authenticated
  USING (
    agent_id = (SELECT auth.uid())
    OR (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'manager')
  )
  WITH CHECK (
    agent_id = (SELECT auth.uid())
    OR (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'manager')
  );

CREATE POLICY "Delete policies"
  ON policies FOR DELETE TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'manager')
  );

-- =====================================================
-- CLAIMS TABLE POLICIES
-- =====================================================

CREATE POLICY "View own claims"
  ON claims FOR SELECT TO authenticated
  USING (
    agent_id = (SELECT auth.uid())
    OR (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'manager')
  );

CREATE POLICY "Insert own claims"
  ON claims FOR INSERT TO authenticated
  WITH CHECK (agent_id = (SELECT auth.uid()));

CREATE POLICY "Update own claims"
  ON claims FOR UPDATE TO authenticated
  USING (
    agent_id = (SELECT auth.uid())
    OR (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'manager')
  )
  WITH CHECK (
    agent_id = (SELECT auth.uid())
    OR (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'manager')
  );

-- =====================================================
-- COMMISSIONS TABLE POLICIES
-- =====================================================

CREATE POLICY "View own commissions"
  ON commissions FOR SELECT TO authenticated
  USING (
    agent_id = (SELECT auth.uid())
    OR (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'manager')
  );

CREATE POLICY "Admins and managers can create commissions"
  ON commissions FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'manager')
  );

CREATE POLICY "Update commissions"
  ON commissions FOR UPDATE TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'manager')
  )
  WITH CHECK (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'manager')
  );

-- =====================================================
-- DOCUMENTS TABLE POLICIES
-- =====================================================

CREATE POLICY "Users can view public documents or admins see all"
  ON documents FOR SELECT TO authenticated
  USING (
    is_public = true
    OR (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

CREATE POLICY "Admins can insert documents"
  ON documents FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

CREATE POLICY "Admins can update documents"
  ON documents FOR UPDATE TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  )
  WITH CHECK (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );

CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'
  );