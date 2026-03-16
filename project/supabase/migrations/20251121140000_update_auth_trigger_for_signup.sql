/*
  # Update Authentication Trigger for Public Signup

  ## Overview
  Updates the authentication trigger to support public signup with additional user metadata
  including phone number and hospital affiliation.

  ## Changes
  1. Update handle_new_user function to store phone and hospital_affiliation from metadata
  2. Ensure new signups get agent role by default

  ## Important Notes
  - New users signing up through the public form will have role 'agent'
  - Phone and hospital affiliation are stored from signup metadata
  - Existing trigger is replaced with updated version
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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
