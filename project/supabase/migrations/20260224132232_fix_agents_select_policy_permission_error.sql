/*
  # Fix Agents Select Policy Permission Error

  1. Changes
    - Drop the existing agents select policy that references auth.users table
    - Create a new select policy using auth.jwt() to check roles
    - This eliminates the permission denied error when querying agents table

  2. Security
    - Maintains same security: users can see their own profile, admins can see all
    - Uses auth.jwt() which is accessible without querying restricted tables
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Agents select policy" ON agents;

-- Create a new policy using auth.jwt() instead of querying auth.users
CREATE POLICY "Agents select policy"
  ON agents
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() 
    OR (auth.jwt() ->> 'role') = 'admin'
  );
