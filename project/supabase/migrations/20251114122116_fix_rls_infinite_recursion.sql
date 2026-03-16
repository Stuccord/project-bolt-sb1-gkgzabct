/*
  # Fix Infinite Recursion in RLS Policies

  ## Problem
  The RLS policies were causing infinite recursion by querying the agents table
  from within the agents table's own policies when checking for admin/manager roles.

  ## Solution
  1. Drop all existing RLS policies on all tables
  2. Create a helper function that uses SECURITY DEFINER to bypass RLS
  3. Recreate policies using the helper function to avoid recursion

  ## Changes
  - Drop all existing policies
  - Create is_admin_or_manager() function with SECURITY DEFINER
  - Recreate all policies without recursive queries
*/

-- Drop all existing policies with correct names
DROP POLICY IF EXISTS "Agents can view their own profile" ON agents;
DROP POLICY IF EXISTS "Admins can view all agents" ON agents;
DROP POLICY IF EXISTS "Admins can insert agents" ON agents;
DROP POLICY IF EXISTS "Agents can update own profile" ON agents;

DROP POLICY IF EXISTS "Agents can view their referred clients" ON clients;
DROP POLICY IF EXISTS "Agents can insert clients" ON clients;
DROP POLICY IF EXISTS "Agents can update their referred clients" ON clients;

DROP POLICY IF EXISTS "Agents can view their policies" ON policies;
DROP POLICY IF EXISTS "Agents can insert policies" ON policies;
DROP POLICY IF EXISTS "Agents can update their policies" ON policies;
DROP POLICY IF EXISTS "Agents can delete their policies" ON policies;

DROP POLICY IF EXISTS "Agents can view their claims" ON claims;
DROP POLICY IF EXISTS "Agents can insert claims" ON claims;
DROP POLICY IF EXISTS "Agents can update their claims" ON claims;

DROP POLICY IF EXISTS "Agents can view their commissions" ON commissions;
DROP POLICY IF EXISTS "System can insert commissions" ON commissions;
DROP POLICY IF EXISTS "Admins can update commissions" ON commissions;

-- Create helper function with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION is_admin_or_manager()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM agents
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager')
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Agents table policies (simple, no recursion)
CREATE POLICY "Users can view own profile"
  ON agents FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON agents FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Clients table policies
CREATE POLICY "View own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (
    referred_by_agent_id = auth.uid()
    OR is_admin_or_manager()
  );

CREATE POLICY "Insert own clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (referred_by_agent_id = auth.uid());

CREATE POLICY "Update own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (
    referred_by_agent_id = auth.uid()
    OR is_admin_or_manager()
  )
  WITH CHECK (
    referred_by_agent_id = auth.uid()
    OR is_admin_or_manager()
  );

-- Policies table policies
CREATE POLICY "View own policies"
  ON policies FOR SELECT
  TO authenticated
  USING (
    agent_id = auth.uid()
    OR is_admin_or_manager()
  );

CREATE POLICY "Insert own policies"
  ON policies FOR INSERT
  TO authenticated
  WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Update own policies"
  ON policies FOR UPDATE
  TO authenticated
  USING (
    agent_id = auth.uid()
    OR is_admin_or_manager()
  )
  WITH CHECK (
    agent_id = auth.uid()
    OR is_admin_or_manager()
  );

CREATE POLICY "Delete policies"
  ON policies FOR DELETE
  TO authenticated
  USING (is_admin_or_manager());

-- Claims table policies
CREATE POLICY "View own claims"
  ON claims FOR SELECT
  TO authenticated
  USING (
    agent_id = auth.uid()
    OR is_admin_or_manager()
  );

CREATE POLICY "Insert own claims"
  ON claims FOR INSERT
  TO authenticated
  WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Update own claims"
  ON claims FOR UPDATE
  TO authenticated
  USING (
    agent_id = auth.uid()
    OR is_admin_or_manager()
  )
  WITH CHECK (
    agent_id = auth.uid()
    OR is_admin_or_manager()
  );

-- Commissions table policies
CREATE POLICY "View own commissions"
  ON commissions FOR SELECT
  TO authenticated
  USING (
    agent_id = auth.uid()
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
