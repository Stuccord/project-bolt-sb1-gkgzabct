/*
  # Fix Mismatched User and Agent IDs
  
  1. Problem
    - Some agent records have different IDs than their corresponding auth.users records
    - This breaks the foreign key relationship and authentication
  
  2. Solution
    - Update agent IDs to match auth.users IDs where email matches
    - Update all related foreign key references
    - Set proper role in app_metadata
  
  3. Security
    - Maintains data integrity
    - Preserves all relationships
*/

-- First, temporarily disable the trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update agent IDs to match auth.users IDs for mismatched records
DO $$
DECLARE
  user_rec RECORD;
  old_agent_id uuid;
BEGIN
  FOR user_rec IN 
    SELECT u.id as user_id, u.email, a.id as agent_id
    FROM auth.users u
    INNER JOIN public.agents a ON u.email = a.email
    WHERE u.id != a.id
  LOOP
    old_agent_id := user_rec.agent_id;
    
    -- Update referrals
    UPDATE public.referrals SET rep_id = user_rec.user_id WHERE rep_id = old_agent_id;
    
    -- Update clients
    UPDATE public.clients SET referred_by_agent_id = user_rec.user_id WHERE referred_by_agent_id = old_agent_id;
    
    -- Update policies
    UPDATE public.policies SET agent_id = user_rec.user_id WHERE agent_id = old_agent_id;
    
    -- Update claims
    UPDATE public.claims SET agent_id = user_rec.user_id WHERE agent_id = old_agent_id;
    
    -- Update commissions
    UPDATE public.commissions SET agent_id = user_rec.user_id WHERE agent_id = old_agent_id;
    
    -- Update documents
    UPDATE public.documents SET uploaded_by = user_rec.user_id WHERE uploaded_by = old_agent_id;
    
    -- Update support tickets
    UPDATE public.support_tickets SET rep_id = user_rec.user_id WHERE rep_id = old_agent_id;
    
    -- Update notifications (recipient)
    UPDATE public.notifications SET recipient_id = user_rec.user_id WHERE recipient_id = old_agent_id;
    
    -- Update notifications (creator)
    UPDATE public.notifications SET created_by = user_rec.user_id WHERE created_by = old_agent_id;
    
    -- Update payment methods
    UPDATE public.payment_methods SET rep_id = user_rec.user_id WHERE rep_id = old_agent_id;
    
    -- Update withdrawal requests (requester)
    UPDATE public.withdrawal_requests SET rep_id = user_rec.user_id WHERE rep_id = old_agent_id;
    
    -- Update withdrawal requests (processor)
    UPDATE public.withdrawal_requests SET processed_by = user_rec.user_id WHERE processed_by = old_agent_id;
    
    -- Finally, update the agent record itself
    UPDATE public.agents SET id = user_rec.user_id WHERE id = old_agent_id;
    
    RAISE NOTICE 'Fixed agent ID mismatch for email: %', user_rec.email;
  END LOOP;
END $$;

-- Now create agent records for any users who still don't have one
INSERT INTO public.agents (
  id,
  email,
  full_name,
  phone,
  hospital_affiliation,
  role,
  is_active
)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_app_meta_data->>'full_name',
    split_part(u.email, '@', 1)
  ),
  COALESCE(
    u.raw_user_meta_data->>'phone',
    u.raw_app_meta_data->>'phone',
    ''
  ),
  COALESCE(
    u.raw_user_meta_data->>'hospital_affiliation',
    u.raw_app_meta_data->>'hospital_affiliation',
    ''
  ),
  COALESCE(u.raw_app_meta_data->>'role', 'agent'),
  true
FROM auth.users u
LEFT JOIN public.agents a ON u.id = a.id
WHERE a.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Update app_metadata for all users to ensure role is set
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', COALESCE(raw_app_meta_data->>'role', 'agent'))
WHERE raw_app_meta_data->>'role' IS NULL;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
