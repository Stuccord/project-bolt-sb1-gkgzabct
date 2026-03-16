/*
  # Fix Security and Performance Issues

  1. Performance Improvements
    - Add missing indexes on foreign key columns
    - Improves query performance for joins and lookups
    - Covers all unindexed foreign keys identified

  2. Security Improvements
    - Convert multiple permissive policies to restrictive policies
    - Fix function search path mutability
    - Ensures more predictable and secure policy evaluation

  3. Changes
    - Add indexes on foreign keys in claims, commissions, documents, notifications, policies, and withdrawal_requests
    - Replace multiple permissive SELECT/UPDATE policies on agents with single policies using OR conditions
    - Update is_admin() function to use immutable search_path
*/

-- Add missing indexes on foreign keys for performance
CREATE INDEX IF NOT EXISTS idx_claims_client_id ON claims(client_id);
CREATE INDEX IF NOT EXISTS idx_claims_policy_id ON claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_commissions_client_id ON commissions(client_id);
CREATE INDEX IF NOT EXISTS idx_commissions_policy_id ON commissions(policy_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_notifications_created_by ON notifications(created_by);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_policies_client_id ON policies(client_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_processed_by ON withdrawal_requests(processed_by);

-- Fix multiple permissive policies by combining them into single policies
-- First, drop the existing SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON agents;
DROP POLICY IF EXISTS "Admins can view all agents" ON agents;

-- Create a single SELECT policy with OR condition
CREATE POLICY "Users can view own profile or admins can view all"
  ON agents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR is_admin());

-- Drop the existing UPDATE policies
DROP POLICY IF EXISTS "Users can update own profile" ON agents;
DROP POLICY IF EXISTS "Admins can update any agent" ON agents;

-- Create a single UPDATE policy with OR condition
CREATE POLICY "Users can update own profile or admins can update any"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());

-- Fix function search path mutability
-- Drop and recreate is_admin() with proper search_path security using CASCADE
DROP FUNCTION IF EXISTS is_admin() CASCADE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM agents
    WHERE id = auth.uid()
    AND role = 'admin'
    AND is_active = true
  );
END;
$$;

-- Recreate the policies that depend on is_admin()
CREATE POLICY "Admins can delete agents"
  ON agents
  FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can view own profile or admins can view all"
  ON agents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile or admins can update any"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());
