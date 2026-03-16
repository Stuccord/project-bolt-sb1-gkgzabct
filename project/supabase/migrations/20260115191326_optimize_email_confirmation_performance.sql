/*
  # Optimize Email Confirmation Performance

  ## Problem
  When users click email confirmation links in Gmail, the page takes a long time to load because:
  1. The auth trigger takes time to create the agent record and update JWT metadata
  2. The JWT doesn't immediately contain the role information
  3. RLS policies fail without the role in the JWT

  ## Solution
  1. Optimize the handle_new_user trigger for faster execution
  2. Use JSONB operators more efficiently
  3. Add defensive checks to prevent errors
  4. Ensure role is set immediately in app_metadata

  ## Changes
  - Optimize handle_new_user trigger for speed
  - Use more efficient JSONB operations
  - Add proper error handling
  - Ensure app_metadata is set atomically
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  user_role text;
  user_name text;
  user_phone text;
  user_hospital text;
  agent_exists boolean;
BEGIN
  -- Check if agent already exists to avoid duplicate inserts
  SELECT EXISTS(SELECT 1 FROM public.agents WHERE id = new.id) INTO agent_exists;
  
  IF agent_exists THEN
    RETURN new;
  END IF;

  -- Extract data from raw_user_meta_data (faster than COALESCE chains)
  user_name := new.raw_user_meta_data->>'full_name';
  IF user_name IS NULL OR user_name = '' THEN
    user_name := new.raw_app_meta_data->>'full_name';
  END IF;
  IF user_name IS NULL OR user_name = '' THEN
    user_name := split_part(new.email, '@', 1);
  END IF;
  
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

  -- Insert into agents table (single operation)
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
  )
  ON CONFLICT (id) DO NOTHING;

  -- Update auth.users app_metadata with role
  -- Use || for JSONB concatenation (faster than jsonb_build_object)
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    ('{"role":"' || user_role || '"}')::jsonb
  WHERE id = new.id;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add index on agents.email for faster lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);

-- Add index on agents.role for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_agents_role ON agents(role) WHERE role IN ('admin', 'manager');
