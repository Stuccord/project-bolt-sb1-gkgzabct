/*
  # Add Missing Foreign Key Indexes and Remove Unused Indexes

  ## Overview
  This migration addresses the remaining index issues:
  - Adds indexes for foreign keys that are missing them
  - Removes indexes that are not being used (optimization)

  ## Changes Made

  ### 1. Add Missing Foreign Key Indexes
  - Add index on claims.policy_id (missing FK index)
  - Add index on policies.client_id (missing FK index)

  ### 2. Remove Unused Indexes
  - Drop idx_claims_client_id (not used)
  - Drop idx_commissions_client_id (not used)
  - Drop idx_commissions_policy_id (not used)

  ## Performance Impact
  - Faster joins and lookups on frequently queried foreign keys
  - Reduced storage and maintenance overhead from unused indexes
*/

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_claims_policy_id ON claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_policies_client_id ON policies(client_id);

-- Remove unused indexes to optimize storage and maintenance
DROP INDEX IF EXISTS idx_claims_client_id;
DROP INDEX IF EXISTS idx_commissions_client_id;
DROP INDEX IF EXISTS idx_commissions_policy_id;
