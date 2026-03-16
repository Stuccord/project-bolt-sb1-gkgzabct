/*
  # Fix Auth Trigger to Use Metadata for Phone

  ## Overview
  Updates the handle_new_user trigger to properly extract phone and hospital_affiliation
  from user metadata instead of requiring a separate update query.

  ## Changes
  1. Update handle_new_user function to use metadata for all fields including phone
  2. This eliminates the need for a separate update after signup

  ## Security
  - No RLS changes needed
  - Function remains SECURITY DEFINER for auth.users access
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
