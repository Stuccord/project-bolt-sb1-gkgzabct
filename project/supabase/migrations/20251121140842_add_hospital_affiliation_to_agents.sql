/*
  # Add Hospital Affiliation Column to Agents Table

  ## Overview
  Adds the hospital_affiliation column to the agents table to support public signup
  where users can specify their hospital affiliation.

  ## Changes
  1. Add hospital_affiliation column to agents table (nullable text field)
  2. Update handle_new_user function to correctly insert hospital_affiliation

  ## Important Notes
  - Hospital affiliation is optional for signups
  - Existing agents will have NULL for this field
*/

-- Add hospital_affiliation column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'hospital_affiliation'
  ) THEN
    ALTER TABLE agents ADD COLUMN hospital_affiliation text;
  END IF;
END $$;

-- Update the handle_new_user function to include hospital_affiliation
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
