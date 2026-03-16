/*
  # Add Agent Delete Policy

  1. Changes
    - Add DELETE policy for agents table
    - Only admins can delete agents
    - Uses the existing is_admin() function for consistency

  2. Security
    - Restricts deletion to admin users only
    - Maintains data integrity and access control
*/

-- Create delete policy for agents
CREATE POLICY "Admins can delete agents"
  ON agents
  FOR DELETE
  TO authenticated
  USING (is_admin());
