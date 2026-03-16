/*
  # Optimize Admin Agents Policies

  1. Changes
    - Drop existing admin policies that cause N+1 queries
    - Create optimized policies using a function to check admin role
    - This prevents the subquery from running for each row

  2. Performance
    - Uses a stable function to cache the role check
    - Dramatically improves query performance for admins
*/

-- Drop the slow policies
DROP POLICY IF EXISTS "Admins can view all agents" ON agents;
DROP POLICY IF EXISTS "Admins can update any agent" ON agents;

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM agents
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create optimized policies using the function
CREATE POLICY "Admins can view all agents"
  ON agents
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update any agent"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
