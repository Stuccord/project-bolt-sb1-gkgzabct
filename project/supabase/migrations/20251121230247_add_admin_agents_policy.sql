/*
  # Add Admin Access Policy for Agents Table

  1. Changes
    - Add policy allowing admins to view all agents
    - Add policy allowing admins to update any agent

  2. Security
    - Only users with 'admin' role can view and update all agents
    - Maintains existing policies for regular users to view/update their own profiles
*/

-- Allow admins to view all agents
CREATE POLICY "Admins can view all agents"
  ON agents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Allow admins to update any agent
CREATE POLICY "Admins can update any agent"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
