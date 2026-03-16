-- Update BearGuard Referral System Requirements
--
-- Changes:
-- 1. Commission changed to flat GHS 200 per completed case (not 5%)
-- 2. Change injury_type to injured_or_deceased
-- 3. Remove claim_amount tracking
-- 4. Update commission calculation to flat rate
--
-- IMPORTANT: This migration preserves existing data

-- Add new column for injured/deceased status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'referrals' AND column_name = 'injured_or_deceased'
  ) THEN
    ALTER TABLE referrals ADD COLUMN injured_or_deceased text;
  END IF;
END $$;

-- Copy data from injury_type to injured_or_deceased
UPDATE referrals 
SET injured_or_deceased = 'Injured'
WHERE injured_or_deceased IS NULL;

-- Update commission amounts to flat GHS 200 for paid cases
UPDATE referrals
SET commission_amount = 200.00
WHERE status = 'paid' AND commission_paid = true;

-- Remove the trigger that calculates commission as percentage
DROP TRIGGER IF EXISTS trigger_calculate_commission ON referrals;
DROP FUNCTION IF EXISTS calculate_commission();

-- Create new trigger for flat GHS 200 commission
CREATE OR REPLACE FUNCTION set_flat_commission()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' THEN
    NEW.commission_amount := 200.00;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_flat_commission
  BEFORE INSERT OR UPDATE OF status ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION set_flat_commission();

-- Add comment noting the schema changes
COMMENT ON COLUMN referrals.injured_or_deceased IS 'Status: Injured or Deceased';
COMMENT ON COLUMN referrals.commission_amount IS 'Flat rate: GHS 200 per completed case';
COMMENT ON COLUMN referrals.claim_amount IS 'DEPRECATED - No longer used in commission calculation';
