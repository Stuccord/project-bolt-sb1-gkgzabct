/*
  # Fix Infinite Recursion in Agents Table Policies

  ## Problem
  The RLS policies on the agents table were checking the agents table itself to determine
  if a user is an admin, creating infinite recursion:
  - User queries agents table
  - Policy checks agents table for role
  - That check triggers the same policy
  - Infinite loop

  ## Solution
  Use auth.jwt() to check the user's role from JWT metadata instead of querying agents table.
  The role is set in the user's metadata during signup and can be accessed directly.

  ## Changes
  1. Drop all current agents table policies
  2. Create new policies that use auth.jwt() for role checking
  3. Add policy for inserting new agents (needed for signup trigger)
*/

-- =====================================================
-- DROP ALL EXISTING AGENTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON agents;
DROP POLICY IF EXISTS "Admins can view all profiles" ON agents;
DROP POLICY IF EXISTS "Users can update own profile" ON agents;
DROP POLICY IF EXISTS "Admins can update any profile" ON agents;
DROP POLICY IF EXISTS "Allow service role full access" ON agents;
DROP POLICY IF EXISTS "Admins can insert agent profiles" ON agents;

-- =====================================================
-- CREATE NEW AGENTS POLICIES WITHOUT RECURSION
-- =====================================================

-- Allow users to view their own profile (no table lookup needed)
CREATE POLICY "Users can view own profile"
  ON agents
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Allow admins to view all profiles (using JWT metadata)
CREATE POLICY "Admins can view all profiles"
  ON agents
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow admins to update any profile (using JWT metadata)
CREATE POLICY "Admins can update any profile"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  )
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );

-- Allow authenticated users to insert their own profile (needed for signup trigger)
CREATE POLICY "Users can insert own profile"
  ON agents
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Allow admins to insert any profile (using JWT metadata)
CREATE POLICY "Admins can insert any profile"
  ON agents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );

-- Allow admins to delete profiles (using JWT metadata)
CREATE POLICY "Admins can delete profiles"
  ON agents
  FOR DELETE
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() -> 'app_metadata' ->> 'role')
    ) = 'admin'
  );

-- =====================================================
-- UPDATE HANDLE_NEW_USER TO SET JWT METADATA
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  user_role text;
  user_name text;
  user_phone text;
  user_hospital text;
BEGIN
  -- Extract data from raw_user_meta_data
  user_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_app_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );
  
  user_phone := COALESCE(
    new.raw_user_meta_data->>'phone',
    new.raw_app_meta_data->>'phone',
    ''
  );
  
  user_hospital := COALESCE(
    new.raw_user_meta_data->>'hospital_affiliation',
    new.raw_app_meta_data->>'hospital_affiliation',
    ''
  );
  
  -- Role defaults to 'agent' for public signups
  user_role := COALESCE(new.raw_app_meta_data->>'role', 'agent');

  -- Update auth.users metadata to include role in JWT
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', user_role)
  WHERE id = new.id;

  -- Insert into agents table
  INSERT INTO public.agents (
    id,
    email,
    full_name,
    phone,
    hospital_affiliation,
    role,
    is_active
  ) VALUES (
    new.id,
    new.email,
    user_name,
    user_phone,
    user_hospital,
    user_role,
    true
  );

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;