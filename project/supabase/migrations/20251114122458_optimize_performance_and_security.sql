/*
  # Optimize Performance and Security

  ## Overview
  This migration addresses security and performance issues identified in the database:
  - Adds missing indexes on foreign keys for optimal query performance
  - Optimizes RLS policies to use (SELECT auth.uid()) pattern to avoid re-evaluation
  - Fixes search_path for functions to be immutable
  - Removes unused indexes

  ## Changes Made

  ### 1. Add Missing Foreign Key Indexes
  - Add index on claims.client_id
  - Add index on commissions.client_id
  - Add index on commissions.policy_id

  ### 2. Optimize RLS Policies
  - Replace auth.uid() with (SELECT auth.uid()) in all policies
  - This prevents re-evaluation per row and improves performance

  ### 3. Fix Function Security
  - Set explicit search_path on functions to prevent role mutable issues

  ### 4. Remove Unused Indexes
  - Drop idx_policies_client (unused)
  - Drop idx_claims_policy (unused)

  ## Performance Impact
  - Faster foreign key lookups with new indexes
  - Improved RLS policy evaluation with SELECT optimization
  - More secure functions with explicit search_path
*/

-- Add missing indexes on foreign keys
CREATE INDEX IF NOT EXISTS idx_claims_client_id ON claims(client_id);
CREATE INDEX IF NOT EXISTS idx_commissions_client_id ON commissions(client_id);
CREATE INDEX IF NOT EXISTS idx_commissions_policy_id ON commissions(policy_id);

-- Remove unused indexes
DROP INDEX IF EXISTS idx_policies_client;
DROP INDEX IF EXISTS idx_claims_policy;

-- Drop all existing policies first (so we can drop functions)
DROP POLICY IF EXISTS "Users can view own profile" ON agents;
DROP POLICY IF EXISTS "Users can update own profile" ON agents;
DROP POLICY IF EXISTS "View own clients" ON clients;
DROP POLICY IF EXISTS "Insert own clients" ON clients;
DROP POLICY IF EXISTS "Update own clients" ON clients;
DROP POLICY IF EXISTS "View own policies" ON policies;
DROP POLICY IF EXISTS "Insert own policies" ON policies;
DROP POLICY IF EXISTS "Update own policies" ON policies;
DROP POLICY IF EXISTS "Delete policies" ON policies;
DROP POLICY IF EXISTS "View own claims" ON claims;
DROP POLICY IF EXISTS "Insert own claims" ON claims;
DROP POLICY IF EXISTS "Update own claims" ON claims;
DROP POLICY IF EXISTS "View own commissions" ON commissions;
DROP POLICY IF EXISTS "Insert commissions" ON commissions;
DROP POLICY IF EXISTS "Update commissions" ON commissions;

-- Now drop and recreate functions with proper search_path
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS handle_new_user();
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.agents (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Agent'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent'),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

DROP FUNCTION IF EXISTS is_admin_or_manager();
CREATE OR REPLACE FUNCTION is_admin_or_manager()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.agents
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager')
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, auth;

-- Recreate agents policies with optimization
CREATE POLICY "Users can view own profile"
  ON agents FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON agents FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Recreate clients policies with optimization
CREATE POLICY "View own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (
    referred_by_agent_id = (SELECT auth.uid())
    OR is_admin_or_manager()
  );

CREATE POLICY "Insert own clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (referred_by_agent_id = (SELECT auth.uid()));

CREATE POLICY "Update own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (
    referred_by_agent_id = (SELECT auth.uid())
    OR is_admin_or_manager()
  )
  WITH CHECK (
    referred_by_agent_id = (SELECT auth.uid())
    OR is_admin_or_manager()
  );

-- Recreate policies policies with optimization
CREATE POLICY "View own policies"
  ON policies FOR SELECT
  TO authenticated
  USING (
    agent_id = (SELECT auth.uid())
    OR is_admin_or_manager()
  );

CREATE POLICY "Insert own policies"
  ON policies FOR INSERT
  TO authenticated
  WITH CHECK (agent_id = (SELECT auth.uid()));

CREATE POLICY "Update own policies"
  ON policies FOR UPDATE
  TO authenticated
  USING (
    agent_id = (SELECT auth.uid())
    OR is_admin_or_manager()
  )
  WITH CHECK (
    agent_id = (SELECT auth.uid())
    OR is_admin_or_manager()
  );

CREATE POLICY "Delete policies"
  ON policies FOR DELETE
  TO authenticated
  USING (is_admin_or_manager());

-- Recreate claims policies with optimization
CREATE POLICY "View own claims"
  ON claims FOR SELECT
  TO authenticated
  USING (
    agent_id = (SELECT auth.uid())
    OR is_admin_or_manager()
  );

CREATE POLICY "Insert own claims"
  ON claims FOR INSERT
  TO authenticated
  WITH CHECK (agent_id = (SELECT auth.uid()));

CREATE POLICY "Update own claims"
  ON claims FOR UPDATE
  TO authenticated
  USING (
    agent_id = (SELECT auth.uid())
    OR is_admin_or_manager()
  )
  WITH CHECK (
    agent_id = (SELECT auth.uid())
    OR is_admin_or_manager()
  );

-- Recreate commissions policies with optimization
CREATE POLICY "View own commissions"
  ON commissions FOR SELECT
  TO authenticated
  USING (
    agent_id = (SELECT auth.uid())
    OR is_admin_or_manager()
  );

CREATE POLICY "Insert commissions"
  ON commissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Update commissions"
  ON commissions FOR UPDATE
  TO authenticated
  USING (is_admin_or_manager())
  WITH CHECK (is_admin_or_manager());
