/*
  # Fix All Table Policies to Avoid Recursion

  ## Problem
  Multiple tables had policies that queried the agents table to check if user is admin,
  causing performance issues and potential recursion.

  ## Solution
  Use auth.jwt() to check user role from JWT metadata instead of querying agents table.

  ## Tables Updated
  - referrals
  - support_tickets
  - notifications
  - payment_methods
  - withdrawal_requests
  - appointments (admins only)
*/

-- =====================================================
-- REFERRALS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Reps can view own referrals" ON referrals;
DROP POLICY IF EXISTS "Admins can view all referrals" ON referrals;
DROP POLICY IF EXISTS "Reps can insert own referrals" ON referrals;
DROP POLICY IF EXISTS "Reps can update own referrals" ON referrals;
DROP POLICY IF EXISTS "Admins can update any referral" ON referrals;

CREATE POLICY "Reps can view own referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (rep_id = auth.uid());

CREATE POLICY "Admins can view all referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );

CREATE POLICY "Reps can insert own referrals"
  ON referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = auth.uid());

CREATE POLICY "Reps can update own referrals"
  ON referrals
  FOR UPDATE
  TO authenticated
  USING (rep_id = auth.uid())
  WITH CHECK (rep_id = auth.uid());

CREATE POLICY "Admins can update any referral"
  ON referrals
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );

-- =====================================================
-- SUPPORT TICKETS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Reps can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Reps can insert own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Reps can update own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can update any ticket" ON support_tickets;

CREATE POLICY "Reps can view own tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (rep_id = auth.uid());

CREATE POLICY "Admins can view all tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );

CREATE POLICY "Reps can insert own tickets"
  ON support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = auth.uid());

CREATE POLICY "Reps can update own tickets"
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING (rep_id = auth.uid())
  WITH CHECK (rep_id = auth.uid());

CREATE POLICY "Admins can update any ticket"
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );

-- =====================================================
-- NOTIFICATIONS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can update any notification" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    recipient_id = auth.uid()
    OR recipient_id IS NULL
  );

CREATE POLICY "Admins can view all notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );

CREATE POLICY "Admins can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "Admins can update any notification"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );

-- =====================================================
-- PAYMENT METHODS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Reps can view own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Admins can view all payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Reps can insert own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Reps can update own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Admins can update any payment methods" ON payment_methods;

CREATE POLICY "Reps can view own payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (rep_id = auth.uid());

CREATE POLICY "Admins can view all payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );

CREATE POLICY "Reps can insert own payment methods"
  ON payment_methods
  FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = auth.uid());

CREATE POLICY "Reps can update own payment methods"
  ON payment_methods
  FOR UPDATE
  TO authenticated
  USING (rep_id = auth.uid())
  WITH CHECK (rep_id = auth.uid());

CREATE POLICY "Admins can update any payment methods"
  ON payment_methods
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );

-- =====================================================
-- WITHDRAWAL REQUESTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Reps can view own withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Admins can view all withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Reps can insert own withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Reps can update own withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Admins can update any withdrawal request" ON withdrawal_requests;

CREATE POLICY "Reps can view own withdrawal requests"
  ON withdrawal_requests
  FOR SELECT
  TO authenticated
  USING (rep_id = auth.uid());

CREATE POLICY "Admins can view all withdrawal requests"
  ON withdrawal_requests
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );

CREATE POLICY "Reps can insert own withdrawal requests"
  ON withdrawal_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = auth.uid());

CREATE POLICY "Reps can update own withdrawal requests"
  ON withdrawal_requests
  FOR UPDATE
  TO authenticated
  USING (rep_id = auth.uid())
  WITH CHECK (rep_id = auth.uid());

CREATE POLICY "Admins can update any withdrawal request"
  ON withdrawal_requests
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );

-- =====================================================
-- APPOINTMENTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can insert appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can update appointments" ON appointments;

-- Public appointments - anyone can create
CREATE POLICY "Anyone can insert appointments"
  ON appointments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can view and manage appointments
CREATE POLICY "Admins can view all appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );

CREATE POLICY "Admins can update appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );