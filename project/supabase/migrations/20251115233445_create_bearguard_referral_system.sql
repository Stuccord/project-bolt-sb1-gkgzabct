-- BearGuard Referral System Schema
--
-- 1. New Tables
--    - referrals: Track victim referrals and case progress
--    - documents: Store downloadable forms and manuals
--    - support_tickets: Handle rep complaints and support requests
--    - notifications: System-wide and targeted notifications
--
-- 2. Security
--    - RLS enabled on all tables
--    - Reps see only their own data
--    - Admins/managers have full access
--
-- 3. Indexes for performance

-- Create referral status enum
DO $$ BEGIN
  CREATE TYPE referral_status AS ENUM (
    'awaiting_police_report',
    'awaiting_payment',
    'in_review',
    'submitted',
    'paid'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create support ticket status enum
DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create support ticket priority enum
DO $$ BEGIN
  CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text UNIQUE NOT NULL,
  rep_id uuid REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_email text,
  hospital text NOT NULL,
  injury_type text NOT NULL,
  accident_date date NOT NULL,
  accident_description text NOT NULL,
  status referral_status DEFAULT 'awaiting_police_report' NOT NULL,
  assigned_lawyer text,
  assigned_doctor text,
  claim_amount decimal(12, 2),
  commission_amount decimal(12, 2),
  commission_paid boolean DEFAULT false,
  payment_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_type text NOT NULL,
  uploaded_by uuid REFERENCES agents(id) ON DELETE SET NULL,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL,
  rep_id uuid REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  status ticket_status DEFAULT 'open' NOT NULL,
  priority ticket_priority DEFAULT 'medium' NOT NULL,
  admin_response text,
  resolved_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_by uuid REFERENCES agents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referrals_rep_status ON referrals(rep_id, status);
CREATE INDEX IF NOT EXISTS idx_referrals_case_number ON referrals(case_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_rep_status ON support_tickets(rep_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read ON notifications(recipient_id, is_read);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Referrals policies
CREATE POLICY "Reps can view own referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (
    rep_id = auth.uid() OR
    EXISTS (SELECT 1 FROM agents WHERE agents.id = auth.uid() AND agents.role IN ('admin', 'manager'))
  );

CREATE POLICY "Reps can create referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = auth.uid());

CREATE POLICY "Only admins can update referrals"
  ON referrals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = auth.uid() AND agents.role = 'admin')
  );

-- Documents policies
CREATE POLICY "All authenticated users can view public documents"
  ON documents FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Admins can manage documents"
  ON documents FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = auth.uid() AND agents.role = 'admin')
  );

-- Support tickets policies
CREATE POLICY "Reps can view own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (
    rep_id = auth.uid() OR
    EXISTS (SELECT 1 FROM agents WHERE agents.id = auth.uid() AND agents.role IN ('admin', 'manager'))
  );

CREATE POLICY "Reps can create support tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (rep_id = auth.uid());

CREATE POLICY "Admins can update support tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = auth.uid() AND agents.role IN ('admin', 'manager'))
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications and broadcasts"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    recipient_id = auth.uid() OR
    recipient_id IS NULL OR
    EXISTS (SELECT 1 FROM agents WHERE agents.id = auth.uid() AND agents.role IN ('admin', 'manager'))
  );

CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM agents WHERE agents.id = auth.uid() AND agents.role = 'admin')
  );

CREATE POLICY "Users can mark own notifications as read"
  ON notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Function to auto-generate case numbers
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS text AS $$
DECLARE
  year_part text;
  sequence_num int;
  case_num text;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO sequence_num FROM referrals WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  case_num := 'BG-' || year_part || '-' || LPAD(sequence_num::text, 4, '0');
  RETURN case_num;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS text AS $$
DECLARE
  year_part text;
  sequence_num int;
  ticket_num text;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO sequence_num FROM support_tickets WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  ticket_num := 'TKT-' || year_part || '-' || LPAD(sequence_num::text, 4, '0');
  RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate case numbers
CREATE OR REPLACE FUNCTION set_case_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.case_number IS NULL OR NEW.case_number = '' THEN
    NEW.case_number := generate_case_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_case_number
  BEFORE INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION set_case_number();

-- Trigger to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- Trigger to auto-calculate commission (5% of claim amount)
CREATE OR REPLACE FUNCTION calculate_commission()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.claim_amount IS NOT NULL THEN
    NEW.commission_amount := NEW.claim_amount * 0.05;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_commission
  BEFORE INSERT OR UPDATE OF claim_amount ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION calculate_commission();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
