/*
  # Fix Orphaned Auth Users

  1. Problem
    - Several users exist in auth.users but don't have corresponding agent records
    - This prevents them from logging in even though their auth credentials are valid
    - The trigger may have failed during their signup

  2. Solution
    - Create agent records for all orphaned auth users
    - Set them as active agents by default
    - Extract user data from their auth metadata

  3. Changes
    - Insert missing agent records for orphaned users
    - Ensures all auth users can login successfully
*/

-- Create agent records for any auth users that don't have them
INSERT INTO public.agents (id, email, full_name, phone, hospital_affiliation, role, is_active)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  COALESCE(au.raw_user_meta_data->>'phone', '') as phone,
  COALESCE(au.raw_user_meta_data->>'hospital_affiliation', '') as hospital_affiliation,
  COALESCE(au.raw_user_meta_data->>'role', 'agent') as role,
  true as is_active
FROM auth.users au
LEFT JOIN public.agents ag ON au.id = ag.id
WHERE ag.id IS NULL
  AND au.email_confirmed_at IS NOT NULL;
