/*
  # Fix RLS Performance Optimization - Final

  ## Problem
  Auth function calls were not properly wrapped in SELECT statements.
  The SELECT must wrap the auth function call itself, not the entire expression.

  ## Correct Pattern
  Wrong: (SELECT (auth.jwt() -> 'app_metadata' ->> 'role'))
  Right: ((select auth.jwt()) -> 'app_metadata' ->> 'role')

  ## Changes
  - Drop all policies
  - Recreate with proper SELECT wrapping for all auth function calls
  - This prevents re-evaluation of auth functions for each row
*/

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
  USING (id = (select auth.uid()));

CREATE POLICY "Admins can view all profiles"
  ON agents FOR SELECT TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Users can update own profile"
  ON agents FOR UPDATE TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Admins can update any profile"
  ON agents FOR UPDATE TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Users can insert own profile"
  ON agents FOR INSERT TO authenticated
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Admins can insert any profile"
  ON agents FOR INSERT TO authenticated
  WITH CHECK (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can delete profiles"
  ON agents FOR DELETE TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

-- =====================================================
-- REFERRALS TABLE POLICIES
-- =====================================================

CREATE POLICY "Reps can view own referrals"
  ON referrals FOR SELECT TO authenticated
  USING (rep_id = (select auth.uid()));

CREATE POLICY "Admins can view all referrals"
  ON referrals FOR SELECT TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Reps can insert own referrals"
  ON referrals FOR INSERT TO authenticated
  WITH CHECK (rep_id = (select auth.uid()));

CREATE POLICY "Reps can update own referrals"
  ON referrals FOR UPDATE TO authenticated
  USING (rep_id = (select auth.uid()))
  WITH CHECK (rep_id = (select auth.uid()));

CREATE POLICY "Admins can update any referral"
  ON referrals FOR UPDATE TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

-- =====================================================
-- SUPPORT TICKETS TABLE POLICIES
-- =====================================================

CREATE POLICY "Reps can view own tickets"
  ON support_tickets FOR SELECT TO authenticated
  USING (rep_id = (select auth.uid()));

CREATE POLICY "Admins can view all tickets"
  ON support_tickets FOR SELECT TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Reps can insert own tickets"
  ON support_tickets FOR INSERT TO authenticated
  WITH CHECK (rep_id = (select auth.uid()));

CREATE POLICY "Reps can update own tickets"
  ON support_tickets FOR UPDATE TO authenticated
  USING (rep_id = (select auth.uid()))
  WITH CHECK (rep_id = (select auth.uid()));

CREATE POLICY "Admins can update any ticket"
  ON support_tickets FOR UPDATE TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

-- =====================================================
-- NOTIFICATIONS TABLE POLICIES
-- =====================================================

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (recipient_id = (select auth.uid()) OR recipient_id IS NULL);

CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (recipient_id = (select auth.uid()))
  WITH CHECK (recipient_id = (select auth.uid()));

CREATE POLICY "Admins can update any notification"
  ON notifications FOR UPDATE TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

-- =====================================================
-- PAYMENT METHODS TABLE POLICIES
-- =====================================================

CREATE POLICY "Reps can view own payment methods"
  ON payment_methods FOR SELECT TO authenticated
  USING (rep_id = (select auth.uid()));

CREATE POLICY "Admins can view all payment methods"
  ON payment_methods FOR SELECT TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Reps can insert own payment methods"
  ON payment_methods FOR INSERT TO authenticated
  WITH CHECK (rep_id = (select auth.uid()));

CREATE POLICY "Reps can update own payment methods"
  ON payment_methods FOR UPDATE TO authenticated
  USING (rep_id = (select auth.uid()))
  WITH CHECK (rep_id = (select auth.uid()));

CREATE POLICY "Admins can update any payment methods"
  ON payment_methods FOR UPDATE TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Reps can delete own payment methods"
  ON payment_methods FOR DELETE TO authenticated
  USING (rep_id = (select auth.uid()));

-- =====================================================
-- WITHDRAWAL REQUESTS TABLE POLICIES
-- =====================================================

CREATE POLICY "Reps can view own withdrawal requests"
  ON withdrawal_requests FOR SELECT TO authenticated
  USING (rep_id = (select auth.uid()));

CREATE POLICY "Admins can view all withdrawal requests"
  ON withdrawal_requests FOR SELECT TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Reps can insert own withdrawal requests"
  ON withdrawal_requests FOR INSERT TO authenticated
  WITH CHECK (rep_id = (select auth.uid()));

CREATE POLICY "Reps can update own withdrawal requests"
  ON withdrawal_requests FOR UPDATE TO authenticated
  USING (rep_id = (select auth.uid()))
  WITH CHECK (rep_id = (select auth.uid()));

CREATE POLICY "Admins can update any withdrawal request"
  ON withdrawal_requests FOR UPDATE TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
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
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update appointments"
  ON appointments FOR UPDATE TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

-- =====================================================
-- CLIENTS TABLE POLICIES
-- =====================================================

CREATE POLICY "View own clients"
  ON clients FOR SELECT TO authenticated
  USING (
    referred_by_agent_id = (select auth.uid())
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'manager')
  );

CREATE POLICY "Insert own clients"
  ON clients FOR INSERT TO authenticated
  WITH CHECK (referred_by_agent_id = (select auth.uid()));

CREATE POLICY "Update own clients"
  ON clients FOR UPDATE TO authenticated
  USING (
    referred_by_agent_id = (select auth.uid())
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'manager')
  )
  WITH CHECK (
    referred_by_agent_id = (select auth.uid())
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'manager')
  );

-- =====================================================
-- POLICIES TABLE POLICIES
-- =====================================================

CREATE POLICY "View own policies"
  ON policies FOR SELECT TO authenticated
  USING (
    agent_id = (select auth.uid())
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'manager')
  );

CREATE POLICY "Insert own policies"
  ON policies FOR INSERT TO authenticated
  WITH CHECK (agent_id = (select auth.uid()));

CREATE POLICY "Update own policies"
  ON policies FOR UPDATE TO authenticated
  USING (
    agent_id = (select auth.uid())
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'manager')
  )
  WITH CHECK (
    agent_id = (select auth.uid())
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'manager')
  );

CREATE POLICY "Delete policies"
  ON policies FOR DELETE TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'manager')
  );

-- =====================================================
-- CLAIMS TABLE POLICIES
-- =====================================================

CREATE POLICY "View own claims"
  ON claims FOR SELECT TO authenticated
  USING (
    agent_id = (select auth.uid())
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'manager')
  );

CREATE POLICY "Insert own claims"
  ON claims FOR INSERT TO authenticated
  WITH CHECK (agent_id = (select auth.uid()));

CREATE POLICY "Update own claims"
  ON claims FOR UPDATE TO authenticated
  USING (
    agent_id = (select auth.uid())
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'manager')
  )
  WITH CHECK (
    agent_id = (select auth.uid())
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'manager')
  );

-- =====================================================
-- COMMISSIONS TABLE POLICIES
-- =====================================================

CREATE POLICY "View own commissions"
  ON commissions FOR SELECT TO authenticated
  USING (
    agent_id = (select auth.uid())
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'manager')
  );

CREATE POLICY "Admins and managers can create commissions"
  ON commissions FOR INSERT TO authenticated
  WITH CHECK (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'manager')
  );

CREATE POLICY "Update commissions"
  ON commissions FOR UPDATE TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'manager')
  )
  WITH CHECK (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') IN ('admin', 'manager')
  );

-- =====================================================
-- DOCUMENTS TABLE POLICIES
-- =====================================================

CREATE POLICY "Users can view public documents or admins see all"
  ON documents FOR SELECT TO authenticated
  USING (
    is_public = true
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can insert documents"
  ON documents FOR INSERT TO authenticated
  WITH CHECK (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update documents"
  ON documents FOR UPDATE TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE TO authenticated
  USING (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );