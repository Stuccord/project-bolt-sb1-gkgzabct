/*
  # Fix Infinite Recursion in Agents Table RLS Policies

  ## Problem
  The RLS policies on the `agents` table were querying the `agents` table itself
  to check if a user is an admin, causing infinite recursion and extremely slow
  or failed queries during login.

  ## Solution
  Replace recursive policies with simpler, non-recursive policies:
  - Users can view and update their own profile (no admin check needed)
  - Create separate admin-only policies for viewing/updating other agents
  - Use a helper function that checks auth metadata instead of querying agents table

  ## Changes
  1. Drop existing recursive policies
  2. Create non-recursive policies for own profile access
  3. Create admin policies that use auth metadata
  4. Fix the is_admin() function to not query agents table
*/

-- Drop the recursive policies
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON agents;
DROP POLICY IF EXISTS "Users can update own profile or admins can update any" ON agents;
DROP POLICY IF EXISTS "Admins can delete agents" ON agents;

-- Create a safe helper function that checks admin from auth metadata
CREATE OR REPLACE FUNCTION is_admin_safe()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON agents FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Policy 2: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON agents FOR SELECT
  TO authenticated
  USING (is_admin_safe());

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON agents FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy 4: Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON agents FOR UPDATE
  TO authenticated
  USING (is_admin_safe())
  WITH CHECK (is_admin_safe());

-- Policy 5: Admins can delete agents
CREATE POLICY "Admins can delete agents"
  ON agents FOR DELETE
  TO authenticated
  USING (is_admin_safe());

-- Policy 6: Admins can insert new agents
CREATE POLICY "Admins can insert agents"
  ON agents FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_safe());
