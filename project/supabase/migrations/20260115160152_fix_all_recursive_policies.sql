/*
  # Fix All Recursive RLS Policies

  ## Problem
  Multiple tables have policies that query the agents table to check roles,
  causing infinite recursion when the agents table is accessed.

  ## Solution
  Replace all recursive agent table queries with the safe is_admin_safe() 
  and role check functions that use auth metadata instead.

  ## Tables Fixed
  - appointments
  - commissions
  - documents
  - notifications
  - payment_methods
  - referrals
  - support_tickets
  - withdrawal_requests
*/

-- Create helper functions for role checks
CREATE OR REPLACE FUNCTION is_manager_or_admin_safe()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'manager'),
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================
-- FIX APPOINTMENTS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON appointments;

CREATE POLICY "Admins and managers can update appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (is_manager_or_admin_safe())
  WITH CHECK (is_manager_or_admin_safe());

-- =============================================
-- FIX COMMISSIONS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Admins and managers can create commissions" ON commissions;

CREATE POLICY "Admins and managers can create commissions"
  ON commissions FOR INSERT
  TO authenticated
  WITH CHECK (is_manager_or_admin_safe());

-- =============================================
-- FIX DOCUMENTS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view documents" ON documents;
DROP POLICY IF EXISTS "Admins can insert documents" ON documents;
DROP POLICY IF EXISTS "Admins can update documents" ON documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON documents;

CREATE POLICY "Users can view public documents or admins see all"
  ON documents FOR SELECT
  TO authenticated
  USING (is_public = true OR is_admin_safe());

CREATE POLICY "Admins can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_safe());

CREATE POLICY "Admins can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (is_admin_safe())
  WITH CHECK (is_admin_safe());

CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (is_admin_safe());

-- =============================================
-- FIX NOTIFICATIONS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view own notifications and broadcasts" ON notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;

CREATE POLICY "Users can view own notifications or broadcasts or admins see all"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    recipient_id = auth.uid() OR 
    recipient_id IS NULL OR 
    is_manager_or_admin_safe()
  );

CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_safe());

-- =============================================
-- FIX PAYMENT_METHODS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Reps can view own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can update payment methods" ON payment_methods;

CREATE POLICY "Reps can view own payment methods or admins see all"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (rep_id = auth.uid() OR is_manager_or_admin_safe());

CREATE POLICY "Reps can update own payment methods or admins update any"
  ON payment_methods FOR UPDATE
  TO authenticated
  USING (rep_id = auth.uid() OR is_admin_safe())
  WITH CHECK (rep_id = auth.uid() OR is_admin_safe());

-- =============================================
-- FIX REFERRALS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Reps can view own referrals" ON referrals;
DROP POLICY IF EXISTS "Only admins can update referrals" ON referrals;

CREATE POLICY "Reps can view own referrals or admins see all"
  ON referrals FOR SELECT
  TO authenticated
  USING (rep_id = auth.uid() OR is_manager_or_admin_safe());

CREATE POLICY "Only admins can update referrals"
  ON referrals FOR UPDATE
  TO authenticated
  USING (is_admin_safe())
  WITH CHECK (is_admin_safe());

-- =============================================
-- FIX SUPPORT_TICKETS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Reps can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can update support tickets" ON support_tickets;

CREATE POLICY "Reps can view own tickets or admins see all"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (rep_id = auth.uid() OR is_manager_or_admin_safe());

CREATE POLICY "Admins and managers can update support tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (is_manager_or_admin_safe());

-- =============================================
-- FIX WITHDRAWAL_REQUESTS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Reps can view own withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Admins can update withdrawal requests" ON withdrawal_requests;

CREATE POLICY "Reps can view own withdrawal requests or admins see all"
  ON withdrawal_requests FOR SELECT
  TO authenticated
  USING (rep_id = auth.uid() OR is_manager_or_admin_safe());

CREATE POLICY "Admins can update withdrawal requests"
  ON withdrawal_requests FOR UPDATE
  TO authenticated
  USING (is_admin_safe())
  WITH CHECK (is_admin_safe());
