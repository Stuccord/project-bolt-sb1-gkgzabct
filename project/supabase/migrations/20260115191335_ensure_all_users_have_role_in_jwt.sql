/*
  # Ensure All Users Have Role in JWT

  ## Problem
  Some existing users might not have their role set in auth.users.raw_app_meta_data,
  which means their JWT doesn't contain the role information. This causes RLS
  policies to fail and pages to load slowly.

  ## Solution
  Update all existing users to ensure their role from the agents table is
  properly set in their auth.users.raw_app_meta_data.

  ## Changes
  - Update auth.users.raw_app_meta_data to include role for all users
  - This ensures JWT contains role information for all users
  - Improves performance and reliability of RLS policies
*/

-- Update all users to have role in app_metadata
UPDATE auth.users au
SET raw_app_meta_data = 
  COALESCE(au.raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', a.role)
FROM agents a
WHERE au.id = a.id
  AND (
    au.raw_app_meta_data IS NULL 
    OR au.raw_app_meta_data->>'role' IS NULL
    OR au.raw_app_meta_data->>'role' != a.role
  );
