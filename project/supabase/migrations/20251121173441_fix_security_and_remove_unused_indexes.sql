/*
  # Fix Security Issues and Remove Unused Indexes

  ## Overview
  This migration addresses security concerns and removes unused indexes to improve database performance.

  ## Changes Made

  ### 1. Security Fixes
  - Fix function search_path mutability for `handle_new_user` function
  - Set explicit search_path to prevent security vulnerabilities

  ### 2. Performance Optimization - Remove Unused Indexes
  The following indexes have been identified as unused and will be dropped:
  - `idx_referrals_case_number` - Not used in queries
  - `idx_notifications_recipient_read` - Not used in queries
  - `idx_payment_methods_rep_id` - Not used in queries
  - `idx_withdrawal_requests_status` - Not used in queries
  - `idx_withdrawal_requests_created_at` - Not used in queries
  - `idx_claims_policy_id` - Not used in queries
  - `idx_policies_client_id` - Not used in queries
  - `idx_commissions_policy_id` - Not used in queries
  - `idx_documents_uploaded_by` - Not used in queries
  - `idx_notifications_created_by` - Not used in queries
  - `idx_withdrawal_requests_processed_by` - Not used in queries
  - `idx_claims_client_id` - Not used in queries
  - `idx_commissions_client_id` - Not used in queries
  - `idx_appointments_status` - Not used in queries
  - `idx_appointments_date` - Not used in queries
  - `idx_appointments_created` - Not used in queries

  ## Important Notes
  - Removing unused indexes improves write performance and reduces storage
  - The handle_new_user function now has a secure, immutable search_path
  - If any of these indexes become needed in the future, they can be recreated
*/

-- Fix function security: Set explicit search_path to prevent injection attacks
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.agents (id, email, full_name, phone, hospital_affiliation, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'hospital_affiliation', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent'),
    true
  );

  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;

  RETURN NEW;
END;
$$;

-- Drop unused indexes to improve performance
DROP INDEX IF EXISTS idx_referrals_case_number;
DROP INDEX IF EXISTS idx_notifications_recipient_read;
DROP INDEX IF EXISTS idx_payment_methods_rep_id;
DROP INDEX IF EXISTS idx_withdrawal_requests_status;
DROP INDEX IF EXISTS idx_withdrawal_requests_created_at;
DROP INDEX IF EXISTS idx_claims_policy_id;
DROP INDEX IF EXISTS idx_policies_client_id;
DROP INDEX IF EXISTS idx_commissions_policy_id;
DROP INDEX IF EXISTS idx_documents_uploaded_by;
DROP INDEX IF EXISTS idx_notifications_created_by;
DROP INDEX IF EXISTS idx_withdrawal_requests_processed_by;
DROP INDEX IF EXISTS idx_claims_client_id;
DROP INDEX IF EXISTS idx_commissions_client_id;
DROP INDEX IF EXISTS idx_appointments_status;
DROP INDEX IF EXISTS idx_appointments_date;
DROP INDEX IF EXISTS idx_appointments_created;
