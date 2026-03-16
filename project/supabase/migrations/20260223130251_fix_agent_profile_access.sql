/*
  # Fix Agent Profile Access Issues
  
  1. Changes
    - Update RLS policy on agents table to use raw_app_meta_data instead of JWT
    - This fixes the issue where authenticated users can't fetch their own profile
    - Ensures agents can always read their own data immediately after login
  
  2. Security
    - Maintains security by checking auth.uid() matches the agent id
    - Admins can still see all agents using their role in metadata
*/

-- Drop existing select policy
DROP POLICY IF EXISTS "Agents select policy" ON agents;

-- Create new select policy using raw_app_meta_data
CREATE POLICY "Agents select policy"
  ON agents
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() 
    OR 
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );
