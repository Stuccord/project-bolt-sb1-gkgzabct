/*
  # Disable Email Confirmation Requirement

  ## Overview
  Updates the authentication trigger to automatically confirm user emails upon signup,
  allowing immediate access to the dashboard without email verification.

  ## Changes
  1. Update handle_new_user function to auto-confirm new user emails
  2. This is appropriate for business applications where users need immediate access

  ## Important Notes
  - Users can access the dashboard immediately after signup
  - No email confirmation required
  - Suitable for internal business tools and referral networks
*/

-- Update the handle_new_user function to auto-confirm emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert agent record
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

  -- Auto-confirm email for immediate access
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
