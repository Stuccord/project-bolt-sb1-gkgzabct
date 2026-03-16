/*
  # Fix All Security and Performance Issues

  ## 1. Foreign Key Indexes
  Add indexes for all unindexed foreign keys to improve query performance:
  - claims (agent_id, client_id, policy_id)
  - clients (referred_by_agent_id)
  - commissions (agent_id, client_id, policy_id)
  - documents (uploaded_by)
  - notifications (created_by, recipient_id)
  - payment_methods (rep_id)
  - policies (agent_id, client_id)
  - referrals (rep_id)
  - support_tickets (rep_id)
  - withdrawal_requests (processed_by, rep_id)

  ## 2. RLS Performance Optimization
  Replace all `auth.uid()` calls with `(SELECT auth.uid())` to prevent per-row re-evaluation
  
  ## 3. Remove Duplicate Permissive Policies
  Consolidate multiple permissive policies for appointments table

  ## Security Enhancements
  - All foreign keys now have covering indexes
  - RLS policies optimized for scale
  - Eliminated duplicate permissive policies
*/

-- =====================================================
-- 1. ADD FOREIGN KEY INDEXES
-- =====================================================

-- Claims table indexes
CREATE INDEX IF NOT EXISTS idx_claims_agent_id ON public.claims(agent_id);
CREATE INDEX IF NOT EXISTS idx_claims_client_id ON public.claims(client_id);
CREATE INDEX IF NOT EXISTS idx_claims_policy_id ON public.claims(policy_id);

-- Clients table indexes
CREATE INDEX IF NOT EXISTS idx_clients_referred_by_agent_id ON public.clients(referred_by_agent_id);

-- Commissions table indexes
CREATE INDEX IF NOT EXISTS idx_commissions_agent_id ON public.commissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_commissions_client_id ON public.commissions(client_id);
CREATE INDEX IF NOT EXISTS idx_commissions_policy_id ON public.commissions(policy_id);

-- Documents table indexes
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_created_by ON public.notifications(created_by);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);

-- Payment methods table indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_rep_id ON public.payment_methods(rep_id);

-- Policies table indexes
CREATE INDEX IF NOT EXISTS idx_policies_agent_id ON public.policies(agent_id);
CREATE INDEX IF NOT EXISTS idx_policies_client_id ON public.policies(client_id);

-- Referrals table indexes
CREATE INDEX IF NOT EXISTS idx_referrals_rep_id ON public.referrals(rep_id);

-- Support tickets table indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_rep_id ON public.support_tickets(rep_id);

-- Withdrawal requests table indexes
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_processed_by ON public.withdrawal_requests(processed_by);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_rep_id ON public.withdrawal_requests(rep_id);

-- =====================================================
-- 2. FIX RLS POLICIES - AGENTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admin full access to agents" ON public.agents;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.agents;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.agents;
DROP POLICY IF EXISTS "Users can manage own agent profile" ON public.agents;

CREATE POLICY "Admin full access to agents"
  ON public.agents FOR SELECT
  TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'admin');

CREATE POLICY "Admins can insert profiles"
  ON public.agents FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.jwt()->>'role') = 'admin');

CREATE POLICY "Admins can update profiles"
  ON public.agents FOR UPDATE
  TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt()->>'role') = 'admin');

CREATE POLICY "Users can manage own agent profile"
  ON public.agents FOR ALL
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- =====================================================
-- 3. FIX RLS POLICIES - REFERRALS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admin full access to referrals" ON public.referrals;
DROP POLICY IF EXISTS "Admins can update referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can manage own referrals" ON public.referrals;

CREATE POLICY "Admin full access to referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'admin');

CREATE POLICY "Admins can update referrals"
  ON public.referrals FOR UPDATE
  TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt()->>'role') = 'admin');

CREATE POLICY "Users can manage own referrals"
  ON public.referrals FOR ALL
  TO authenticated
  USING (rep_id = (SELECT auth.uid()))
  WITH CHECK (rep_id = (SELECT auth.uid()));

-- =====================================================
-- 4. FIX RLS POLICIES - SUPPORT_TICKETS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admin full access to support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can manage own tickets" ON public.support_tickets;

CREATE POLICY "Admin full access to support tickets"
  ON public.support_tickets FOR SELECT
  TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'admin');

CREATE POLICY "Admins can update tickets"
  ON public.support_tickets FOR UPDATE
  TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt()->>'role') = 'admin');

CREATE POLICY "Users can manage own tickets"
  ON public.support_tickets FOR ALL
  TO authenticated
  USING (rep_id = (SELECT auth.uid()))
  WITH CHECK (rep_id = (SELECT auth.uid()));

-- =====================================================
-- 5. FIX RLS POLICIES - NOTIFICATIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admin full access to notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;

CREATE POLICY "Admin full access to notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'admin');

CREATE POLICY "Admins can update notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt()->>'role') = 'admin');

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (recipient_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = (SELECT auth.uid()))
  WITH CHECK (recipient_id = (SELECT auth.uid()));

-- =====================================================
-- 6. FIX RLS POLICIES - PAYMENT_METHODS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admin full access to payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Admins can update payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can manage own payment methods" ON public.payment_methods;

CREATE POLICY "Admin full access to payment methods"
  ON public.payment_methods FOR SELECT
  TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'admin');

CREATE POLICY "Admins can update payment methods"
  ON public.payment_methods FOR UPDATE
  TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt()->>'role') = 'admin');

CREATE POLICY "Users can manage own payment methods"
  ON public.payment_methods FOR ALL
  TO authenticated
  USING (rep_id = (SELECT auth.uid()))
  WITH CHECK (rep_id = (SELECT auth.uid()));

-- =====================================================
-- 7. FIX RLS POLICIES - WITHDRAWAL_REQUESTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admin full access to withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Admins can update withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Users can create withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Users can view own withdrawal requests" ON public.withdrawal_requests;

CREATE POLICY "Admin full access to withdrawal requests"
  ON public.withdrawal_requests FOR SELECT
  TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'admin');

CREATE POLICY "Admins can update withdrawal requests"
  ON public.withdrawal_requests FOR UPDATE
  TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt()->>'role') = 'admin');

CREATE POLICY "Users can view own withdrawal requests"
  ON public.withdrawal_requests FOR SELECT
  TO authenticated
  USING (rep_id = (SELECT auth.uid()));

CREATE POLICY "Users can create withdrawal requests"
  ON public.withdrawal_requests FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = (SELECT auth.uid()));

-- =====================================================
-- 8. FIX RLS POLICIES - APPOINTMENTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Valid appointment submissions only" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON public.appointments;

-- Consolidated SELECT policy
CREATE POLICY "Users can view appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'admin');

-- Single INSERT policy for anonymous users
CREATE POLICY "Anyone can create appointments"
  ON public.appointments FOR INSERT
  TO anon
  WITH CHECK (true);

-- Single INSERT policy for authenticated users
CREATE POLICY "Authenticated can create appointments"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE policy
CREATE POLICY "Admins can update appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'admin')
  WITH CHECK ((SELECT auth.jwt()->>'role') = 'admin');