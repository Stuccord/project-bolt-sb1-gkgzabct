/*
  # Fix Comprehensive Security Issues

  ## 1. Auth RLS Initialization Plan Issues
  - Wrap all `auth.jwt()` calls with SELECT to prevent per-row re-evaluation
  - Fix policies on: agents, referrals, support_tickets, notifications, payment_methods, withdrawal_requests, appointments

  ## 2. Multiple Permissive Policies
  - Consolidate overlapping policies into single policies with OR conditions
  - Affects: agents, notifications, payment_methods, referrals, support_tickets, withdrawal_requests

  ## 3. RLS Policy Always True
  - Document intentional public access for appointments (required for anonymous booking)
  - These policies are correct by design

  ## Security Enhancements
  - All RLS policies now use SELECT wrapper for optimal performance
  - Eliminated duplicate permissive policies
  - Maintained necessary public access with proper documentation
*/

-- =====================================================
-- 1. FIX AGENTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admin full access to agents" ON public.agents;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.agents;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.agents;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.agents;
DROP POLICY IF EXISTS "Users can manage own agent profile" ON public.agents;

-- Consolidated SELECT policy
CREATE POLICY "Agents select policy"
  ON public.agents FOR SELECT
  TO authenticated
  USING (
    (SELECT (auth.jwt()->>'role')) = 'admin' 
    OR id = (SELECT auth.uid())
  );

-- Consolidated INSERT policy
CREATE POLICY "Agents insert policy"
  ON public.agents FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT (auth.jwt()->>'role')) = 'admin' 
    OR id = (SELECT auth.uid())
  );

-- Consolidated UPDATE policy
CREATE POLICY "Agents update policy"
  ON public.agents FOR UPDATE
  TO authenticated
  USING (
    (SELECT (auth.jwt()->>'role')) = 'admin' 
    OR id = (SELECT auth.uid())
  )
  WITH CHECK (
    (SELECT (auth.jwt()->>'role')) = 'admin' 
    OR id = (SELECT auth.uid())
  );

-- Consolidated DELETE policy
CREATE POLICY "Agents delete policy"
  ON public.agents FOR DELETE
  TO authenticated
  USING (
    (SELECT (auth.jwt()->>'role')) = 'admin' 
    OR id = (SELECT auth.uid())
  );

-- =====================================================
-- 2. FIX REFERRALS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admin full access to referrals" ON public.referrals;
DROP POLICY IF EXISTS "Admins can update referrals" ON public.referrals;
DROP POLICY IF EXISTS "Reps can insert own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can manage own referrals" ON public.referrals;

-- Consolidated SELECT policy
CREATE POLICY "Referrals select policy"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (
    (SELECT (auth.jwt()->>'role')) = 'admin' 
    OR rep_id = (SELECT auth.uid())
  );

-- Consolidated INSERT policy
CREATE POLICY "Referrals insert policy"
  ON public.referrals FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = (SELECT auth.uid()));

-- Consolidated UPDATE policy
CREATE POLICY "Referrals update policy"
  ON public.referrals FOR UPDATE
  TO authenticated
  USING (
    (SELECT (auth.jwt()->>'role')) = 'admin' 
    OR rep_id = (SELECT auth.uid())
  )
  WITH CHECK (
    (SELECT (auth.jwt()->>'role')) = 'admin' 
    OR rep_id = (SELECT auth.uid())
  );

-- =====================================================
-- 3. FIX SUPPORT_TICKETS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admin full access to support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Reps can insert own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can manage own tickets" ON public.support_tickets;

-- Consolidated SELECT policy
CREATE POLICY "Support tickets select policy"
  ON public.support_tickets FOR SELECT
  TO authenticated
  USING (
    (SELECT (auth.jwt()->>'role')) = 'admin' 
    OR rep_id = (SELECT auth.uid())
  );

-- Consolidated INSERT policy
CREATE POLICY "Support tickets insert policy"
  ON public.support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = (SELECT auth.uid()));

-- Consolidated UPDATE policy
CREATE POLICY "Support tickets update policy"
  ON public.support_tickets FOR UPDATE
  TO authenticated
  USING (
    (SELECT (auth.jwt()->>'role')) = 'admin' 
    OR rep_id = (SELECT auth.uid())
  )
  WITH CHECK (
    (SELECT (auth.jwt()->>'role')) = 'admin' 
    OR rep_id = (SELECT auth.uid())
  );

-- =====================================================
-- 4. FIX NOTIFICATIONS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admin full access to notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- Consolidated SELECT policy
CREATE POLICY "Notifications select policy"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (
    (SELECT (auth.jwt()->>'role')) = 'admin' 
    OR recipient_id = (SELECT auth.uid())
  );

-- Consolidated UPDATE policy
CREATE POLICY "Notifications update policy"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (
    (SELECT (auth.jwt()->>'role')) = 'admin' 
    OR recipient_id = (SELECT auth.uid())
  )
  WITH CHECK (
    (SELECT (auth.jwt()->>'role')) = 'admin' 
    OR recipient_id = (SELECT auth.uid())
  );

-- =====================================================
-- 5. FIX PAYMENT_METHODS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admin full access to payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Admins can update payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Reps can insert own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Reps can delete own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can manage own payment methods" ON public.payment_methods;

-- Consolidated SELECT policy
CREATE POLICY "Payment methods select policy"
  ON public.payment_methods FOR SELECT
  TO authenticated
  USING (
    (SELECT (auth.jwt()->>'role')) = 'admin' 
    OR rep_id = (SELECT auth.uid())
  );

-- Consolidated INSERT policy
CREATE POLICY "Payment methods insert policy"
  ON public.payment_methods FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = (SELECT auth.uid()));

-- Consolidated UPDATE policy
CREATE POLICY "Payment methods update policy"
  ON public.payment_methods FOR UPDATE
  TO authenticated
  USING (
    (SELECT (auth.jwt()->>'role')) = 'admin' 
    OR rep_id = (SELECT auth.uid())
  )
  WITH CHECK (
    (SELECT (auth.jwt()->>'role')) = 'admin' 
    OR rep_id = (SELECT auth.uid())
  );

-- Consolidated DELETE policy
CREATE POLICY "Payment methods delete policy"
  ON public.payment_methods FOR DELETE
  TO authenticated
  USING (rep_id = (SELECT auth.uid()));

-- =====================================================
-- 6. FIX WITHDRAWAL_REQUESTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admin full access to withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Admins can update withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Reps can insert own withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Users can create withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Users can view own withdrawal requests" ON public.withdrawal_requests;

-- Consolidated SELECT policy
CREATE POLICY "Withdrawal requests select policy"
  ON public.withdrawal_requests FOR SELECT
  TO authenticated
  USING (
    (SELECT (auth.jwt()->>'role')) = 'admin' 
    OR rep_id = (SELECT auth.uid())
  );

-- Consolidated INSERT policy
CREATE POLICY "Withdrawal requests insert policy"
  ON public.withdrawal_requests FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = (SELECT auth.uid()));

-- Consolidated UPDATE policy
CREATE POLICY "Withdrawal requests update policy"
  ON public.withdrawal_requests FOR UPDATE
  TO authenticated
  USING ((SELECT (auth.jwt()->>'role')) = 'admin')
  WITH CHECK ((SELECT (auth.jwt()->>'role')) = 'admin');

-- =====================================================
-- 7. FIX APPOINTMENTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated can create appointments" ON public.appointments;

-- SELECT policy with optimized auth check
CREATE POLICY "Appointments select policy"
  ON public.appointments FOR SELECT
  TO authenticated
  USING ((SELECT (auth.jwt()->>'role')) = 'admin');

-- INSERT policy for anonymous users (public appointment booking)
-- Note: WITH CHECK (true) is intentional to allow public appointment booking
CREATE POLICY "Appointments public insert policy"
  ON public.appointments FOR INSERT
  TO anon
  WITH CHECK (true);

-- INSERT policy for authenticated users
-- Note: WITH CHECK (true) is intentional to allow all authenticated users to book
CREATE POLICY "Appointments authenticated insert policy"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE policy with optimized auth check
CREATE POLICY "Appointments update policy"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING ((SELECT (auth.jwt()->>'role')) = 'admin')
  WITH CHECK ((SELECT (auth.jwt()->>'role')) = 'admin');