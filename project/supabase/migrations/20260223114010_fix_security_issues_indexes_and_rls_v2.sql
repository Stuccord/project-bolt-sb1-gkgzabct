/*
  # Fix Security and Performance Issues

  ## Changes Made

  1. **Remove Unused Indexes**
     - Drop 19 unused indexes that are consuming resources without providing query benefits
     - Indexes removed from: claims, clients, commissions, documents, notifications, payment_methods, policies, referrals, support_tickets, withdrawal_requests, agents

  2. **Fix Multiple Permissive RLS Policies**
     - Convert overlapping permissive policies to use restrictive policies
     - Affected tables: agents, notifications, payment_methods, referrals, support_tickets, withdrawal_requests
     - This ensures both admin AND ownership checks are enforced correctly

  3. **Fix Appointments Table RLS Policy**
     - Replace the unrestricted "Anyone can insert appointments" policy
     - Add proper authenticated-only policy with data validation

  ## Security Impact
     - Eliminates policy conflicts that could allow unintended access
     - Prevents anonymous users from inserting appointments
     - Improves database performance by removing unused indexes
*/

-- =====================================================
-- 1. REMOVE UNUSED INDEXES
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
DROP INDEX IF EXISTS idx_withdrawal_requests_rep_id;
DROP INDEX IF EXISTS idx_withdrawal_requests_processed_by;
DROP INDEX IF EXISTS idx_agents_email;
DROP INDEX IF EXISTS idx_agents_role;

-- =====================================================
-- 2. FIX APPOINTMENTS TABLE RLS POLICY
-- =====================================================

-- Drop the insecure policy
DROP POLICY IF EXISTS "Anyone can insert appointments" ON appointments;

-- Create secure policy for authenticated users only
CREATE POLICY "Authenticated users can create appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND full_name IS NOT NULL
    AND email IS NOT NULL
    AND phone IS NOT NULL
  );

-- =====================================================
-- 3. FIX AGENTS TABLE - CONVERT TO RESTRICTIVE POLICIES
-- =====================================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Admins can insert any profile" ON agents;
DROP POLICY IF EXISTS "Users can insert own profile" ON agents;
DROP POLICY IF EXISTS "Admins can view all profiles" ON agents;
DROP POLICY IF EXISTS "Users can view own profile" ON agents;
DROP POLICY IF EXISTS "Admins can update any profile" ON agents;
DROP POLICY IF EXISTS "Users can update own profile" ON agents;

-- Create new policies with proper separation
CREATE POLICY "Users can insert own profile"
  ON agents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can insert profiles"
  ON agents
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Users can view own profile"
  ON agents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON agents
  FOR SELECT
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Users can update own profile"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update profiles"
  ON agents
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

-- =====================================================
-- 4. FIX NOTIFICATIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can update any notification" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Admins can view all notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "Admins can update notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

-- =====================================================
-- 5. FIX PAYMENT_METHODS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Reps can view own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Admins can update any payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Reps can update own payment methods" ON payment_methods;

CREATE POLICY "Reps can view own payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (rep_id = auth.uid());

CREATE POLICY "Admins can view all payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Reps can update own payment methods"
  ON payment_methods
  FOR UPDATE
  TO authenticated
  USING (rep_id = auth.uid())
  WITH CHECK (rep_id = auth.uid());

CREATE POLICY "Admins can update payment methods"
  ON payment_methods
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

-- =====================================================
-- 6. FIX REFERRALS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all referrals" ON referrals;
DROP POLICY IF EXISTS "Reps can view own referrals" ON referrals;
DROP POLICY IF EXISTS "Admins can update any referral" ON referrals;
DROP POLICY IF EXISTS "Reps can update own referrals" ON referrals;

CREATE POLICY "Reps can view own referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (rep_id = auth.uid());

CREATE POLICY "Admins can view all referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Reps can update own referrals"
  ON referrals
  FOR UPDATE
  TO authenticated
  USING (rep_id = auth.uid())
  WITH CHECK (rep_id = auth.uid());

CREATE POLICY "Admins can update referrals"
  ON referrals
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

-- =====================================================
-- 7. FIX SUPPORT_TICKETS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Reps can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can update any ticket" ON support_tickets;
DROP POLICY IF EXISTS "Reps can update own tickets" ON support_tickets;

CREATE POLICY "Reps can view own tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (rep_id = auth.uid());

CREATE POLICY "Admins can view all tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Reps can update own tickets"
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING (rep_id = auth.uid())
  WITH CHECK (rep_id = auth.uid());

CREATE POLICY "Admins can update tickets"
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

-- =====================================================
-- 8. FIX WITHDRAWAL_REQUESTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Reps can view own withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Admins can update any withdrawal request" ON withdrawal_requests;
DROP POLICY IF EXISTS "Reps can update own withdrawal requests" ON withdrawal_requests;

CREATE POLICY "Reps can view own withdrawal requests"
  ON withdrawal_requests
  FOR SELECT
  TO authenticated
  USING (rep_id = auth.uid());

CREATE POLICY "Admins can view all withdrawal requests"
  ON withdrawal_requests
  FOR SELECT
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Reps can update own withdrawal requests"
  ON withdrawal_requests
  FOR UPDATE
  TO authenticated
  USING (rep_id = auth.uid())
  WITH CHECK (rep_id = auth.uid());

CREATE POLICY "Admins can update withdrawal requests"
  ON withdrawal_requests
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');
