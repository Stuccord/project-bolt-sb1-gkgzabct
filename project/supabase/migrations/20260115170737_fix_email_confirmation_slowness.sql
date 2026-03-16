/*
  # Fix Email Confirmation Slowness
  
  ## Problem
  When new users confirm their email via Gmail and are redirected back to the site,
  the page loads very slowly. This is because:
  
  1. The handle_new_user trigger doesn't set the role in app_metadata
  2. Without role in JWT, RLS policies that check role fail or take longer
  3. The frontend has to retry fetching the agent profile multiple times
  
  ## Solution
  Update the handle_new_user trigger to:
  1. Set the role in auth.users app_metadata immediately
  2. This ensures the JWT contains the role on next session refresh
  3. RLS policies can quickly check the role without additional queries
  
  ## Changes
  - Update handle_new_user function to set app_metadata role
  - This improves initial page load performance after email confirmation
*/

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
  -- Extract data from raw_user_meta_data (this is where signup data goes)
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

  -- CRITICAL: Set role in app_metadata so it's included in JWT
  -- This allows RLS policies to quickly check role without querying agents table
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', user_role)
  WHERE id = new.id;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth signup
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;
