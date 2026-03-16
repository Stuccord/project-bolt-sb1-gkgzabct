/*
  # Update Auth Trigger to Set Role in JWT Metadata

  ## Problem
  The is_admin_safe() and is_manager_or_admin_safe() functions check the
  auth.jwt() app_metadata for the role, but the trigger doesn't set it there.

  ## Solution
  Update the handle_new_user trigger to:
  1. Insert the agent record as before
  2. Update the auth.users app_metadata with the role
  
  ## Note
  The app_metadata in auth.users is included in the JWT token and can be
  accessed by the is_admin_safe() functions without querying the agents table.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role text;
BEGIN
  -- Determine the role
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'agent');
  
  -- Insert into agents table
  INSERT INTO public.agents (id, email, full_name, phone, hospital_affiliation, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'hospital_affiliation', ''),
    user_role,
    true
  );
  
  -- Update auth.users with role in app_metadata
  -- This makes the role available in auth.jwt() without querying agents table
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', user_role)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
