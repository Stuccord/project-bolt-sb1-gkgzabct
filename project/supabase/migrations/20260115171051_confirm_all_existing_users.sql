/*
  # Confirm All Existing Users

  ## Problem
  Users who signed up but haven't confirmed their email can't login.
  Email confirmation is slowing down the onboarding process.

  ## Solution
  Confirm all existing users immediately so they can login.
  The handle_new_user trigger already auto-confirms new signups.

  ## Changes
  - Confirm all existing unconfirmed users
  - Ensures everyone can login immediately
*/

-- Confirm all existing unconfirmed users
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;
