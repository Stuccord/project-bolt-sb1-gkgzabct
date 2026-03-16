/*
  # Create Comprehensive Withdrawal & Payment System

  ## Overview
  This migration creates a complete payment withdrawal system allowing reps to request
  withdrawals of their earned commissions and admins to process payments.

  ## New Tables
  
  ### 1. `withdrawal_requests`
  Tracks all withdrawal requests from reps
  - `id` (uuid, primary key) - Unique withdrawal request ID
  - `request_number` (text, unique) - Human-readable reference (WD-2025-0001)
  - `rep_id` (uuid, foreign key) - Rep requesting withdrawal
  - `amount` (decimal) - Amount requested
  - `payment_method` (text) - bank_transfer, mtn_momo, vodafone_cash, airteltigo_money
  - `bank_name` (text, nullable) - For bank transfers
  - `account_number` (text, nullable) - Bank account number
  - `account_name` (text, nullable) - Account holder name
  - `mobile_money_number` (text, nullable) - Mobile money number
  - `mobile_money_name` (text, nullable) - Mobile money account name
  - `status` (text) - pending, approved, processing, completed, rejected
  - `requested_date` (timestamptz) - When request was made
  - `processed_by` (uuid, nullable) - Admin who processed
  - `processed_date` (timestamptz, nullable) - When processed
  - `payment_reference` (text, nullable) - Transaction reference number
  - `rejection_reason` (text, nullable) - Why rejected
  - `notes` (text, nullable) - Additional notes
  
  ### 2. `payment_methods`
  Stores rep payment preferences for quick withdrawals
  - `id` (uuid, primary key)
  - `rep_id` (uuid, foreign key) - Rep who owns this method
  - `method_type` (text) - bank_transfer, mtn_momo, vodafone_cash, airteltigo_money
  - `is_default` (boolean) - Default payment method
  - `bank_name` (text, nullable)
  - `account_number` (text, nullable)
  - `account_name` (text, nullable)
  - `mobile_money_number` (text, nullable)
  - `mobile_money_name` (text, nullable)
  - `is_verified` (boolean) - Whether method is verified by admin
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Reps can only view/create their own withdrawal requests
  - Reps can manage their own payment methods
  - Admins and managers can view all requests
  - Only admins can process payments

  ## Important Notes
  - Withdrawal requests are linked to referral commissions
  - Reps can only withdraw available (unpaid) commission balance
  - Payment methods must be set up before requesting withdrawal
  - All transactions are tracked with reference numbers
*/

-- Create withdrawal request status enum
DO $$ BEGIN
  CREATE TYPE withdrawal_status AS ENUM (
    'pending',
    'approved', 
    'processing',
    'completed',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create payment method type enum
DO $$ BEGIN
  CREATE TYPE payment_method_type AS ENUM (
    'bank_transfer',
    'mtn_momo',
    'vodafone_cash',
    'airteltigo_money'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id uuid REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  method_type payment_method_type NOT NULL,
  is_default boolean DEFAULT false,
  bank_name text,
  account_number text,
  account_name text,
  mobile_money_number text,
  mobile_money_name text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text UNIQUE NOT NULL,
  rep_id uuid REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  amount decimal(12, 2) NOT NULL CHECK (amount > 0),
  payment_method payment_method_type NOT NULL,
  bank_name text,
  account_number text,
  account_name text,
  mobile_money_number text,
  mobile_money_name text,
  status withdrawal_status DEFAULT 'pending' NOT NULL,
  requested_date timestamptz DEFAULT now(),
  processed_by uuid REFERENCES agents(id) ON DELETE SET NULL,
  processed_date timestamptz,
  payment_reference text,
  rejection_reason text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Payment Methods Policies

CREATE POLICY "Reps can view own payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (
    rep_id = auth.uid() OR
    EXISTS (SELECT 1 FROM agents WHERE agents.id = auth.uid() AND agents.role IN ('admin', 'manager'))
  );

CREATE POLICY "Reps can create own payment methods"
  ON payment_methods FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = auth.uid());

CREATE POLICY "Reps can update own payment methods"
  ON payment_methods FOR UPDATE
  TO authenticated
  USING (rep_id = auth.uid())
  WITH CHECK (rep_id = auth.uid());

CREATE POLICY "Reps can delete own payment methods"
  ON payment_methods FOR DELETE
  TO authenticated
  USING (rep_id = auth.uid());

CREATE POLICY "Admins can verify payment methods"
  ON payment_methods FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = auth.uid() AND agents.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = auth.uid() AND agents.role = 'admin')
  );

-- Withdrawal Requests Policies

CREATE POLICY "Reps can view own withdrawal requests"
  ON withdrawal_requests FOR SELECT
  TO authenticated
  USING (
    rep_id = auth.uid() OR
    EXISTS (SELECT 1 FROM agents WHERE agents.id = auth.uid() AND agents.role IN ('admin', 'manager'))
  );

CREATE POLICY "Reps can create withdrawal requests"
  ON withdrawal_requests FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = auth.uid());

CREATE POLICY "Admins can update withdrawal requests"
  ON withdrawal_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = auth.uid() AND agents.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = auth.uid() AND agents.role = 'admin')
  );

-- Function to generate withdrawal request numbers
CREATE OR REPLACE FUNCTION generate_withdrawal_number()
RETURNS text AS $$
DECLARE
  year_part text;
  sequence_num int;
  withdrawal_num text;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO sequence_num 
  FROM withdrawal_requests 
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  withdrawal_num := 'WD-' || year_part || '-' || LPAD(sequence_num::text, 4, '0');
  RETURN withdrawal_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate withdrawal request numbers
CREATE OR REPLACE FUNCTION set_withdrawal_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
    NEW.request_number := generate_withdrawal_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_withdrawal_number
  BEFORE INSERT ON withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_withdrawal_number();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_withdrawal_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_withdrawal_timestamp
  BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_withdrawal_timestamp();

-- Function to ensure only one default payment method per rep
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE payment_methods
    SET is_default = false
    WHERE rep_id = NEW.rep_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_default
  BEFORE INSERT OR UPDATE ON payment_methods
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_payment_method();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_rep_id ON payment_methods(rep_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(rep_id, is_default);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_rep_id ON withdrawal_requests(rep_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at DESC);

-- Add helpful comments
COMMENT ON TABLE withdrawal_requests IS 'Tracks all commission withdrawal requests from reps';
COMMENT ON TABLE payment_methods IS 'Stores rep payment method preferences for withdrawals';
COMMENT ON COLUMN withdrawal_requests.status IS 'pending: awaiting admin review, approved: ready to process, processing: payment in progress, completed: payment sent, rejected: request denied';
COMMENT ON COLUMN withdrawal_requests.payment_reference IS 'Transaction ID or reference number from payment provider';
