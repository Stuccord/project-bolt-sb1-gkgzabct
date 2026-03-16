/*
  # Setup Authentication Trigger
  
  ## Overview
  This migration creates a function and trigger to automatically create an agent
  record when a new user is created in the auth.users table.
  
  ## Changes
  1. Create function to handle new user creation
  2. Create trigger on auth.users insert
  
  ## Important Notes
  - This ensures that every authenticated user has a corresponding agent record
  - The agent role defaults to 'agent' but can be changed by admins
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.agents (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent'),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
