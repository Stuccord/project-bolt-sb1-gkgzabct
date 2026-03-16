/*
  # Insurance Agency Management System - Database Schema

  ## Overview
  This migration creates a complete database schema for an insurance agency management system
  that tracks clients, policies, claims, and agent commissions.

  ## New Tables

  ### 1. `agents`
  - `id` (uuid, primary key) - Unique agent identifier
  - `email` (text, unique) - Agent login email
  - `full_name` (text) - Agent's full name
  - `role` (text) - Agent role: 'admin', 'agent', or 'manager'
  - `phone` (text) - Contact phone number
  - `avatar_url` (text, nullable) - Profile picture URL
  - `is_active` (boolean) - Whether agent account is active
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. `clients`
  - `id` (uuid, primary key) - Unique client identifier
  - `referred_by_agent_id` (uuid, foreign key) - Agent who referred this client
  - `full_name` (text) - Client's full name
  - `email` (text) - Client email address
  - `phone` (text) - Client phone number
  - `date_of_birth` (date, nullable) - Client's birth date
  - `address` (text, nullable) - Client's address
  - `created_at` (timestamptz) - Referral date

  ### 3. `policies`
  - `id` (uuid, primary key) - Unique policy identifier
  - `policy_number` (text, unique) - Human-readable policy number
  - `client_id` (uuid, foreign key) - Associated client
  - `agent_id` (uuid, foreign key) - Managing agent
  - `policy_type` (text) - Type: 'life', 'health', 'auto', 'home', 'business'
  - `status` (text) - Status: 'pending', 'active', 'expired', 'cancelled'
  - `premium_amount` (decimal) - Policy premium in GHS
  - `coverage_amount` (decimal, nullable) - Coverage amount
  - `start_date` (date, nullable) - Policy start date
  - `end_date` (date, nullable) - Policy end date
  - `created_at` (timestamptz) - Policy creation date
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. `claims`
  - `id` (uuid, primary key) - Unique claim identifier
  - `claim_number` (text, unique) - Human-readable claim number
  - `policy_id` (uuid, foreign key) - Associated policy
  - `client_id` (uuid, foreign key) - Client filing claim
  - `agent_id` (uuid, foreign key) - Handling agent
  - `status` (text) - Status: 'pending', 'approved', 'rejected'
  - `claim_amount` (decimal) - Claimed amount in GHS
  - `approved_amount` (decimal, nullable) - Approved amount if applicable
  - `description` (text) - Claim description
  - `document_urls` (jsonb) - Array of document URLs
  - `filed_date` (timestamptz) - When claim was filed
  - `resolved_date` (timestamptz, nullable) - When claim was resolved
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. `commissions`
  - `id` (uuid, primary key) - Unique commission identifier
  - `agent_id` (uuid, foreign key) - Agent earning commission
  - `policy_id` (uuid, foreign key, nullable) - Associated policy
  - `client_id` (uuid, foreign key) - Associated client
  - `amount` (decimal) - Commission amount in GHS
  - `commission_type` (text) - Type: 'referral', 'renewal', 'bonus'
  - `month` (integer) - Month (1-12)
  - `year` (integer) - Year
  - `status` (text) - Status: 'pending', 'paid'
  - `paid_date` (date, nullable) - When commission was paid
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Agents can only view their own data and clients they referred
  - Admins and managers can view all data
  - Policies for SELECT, INSERT, UPDATE, and DELETE operations

  ## Important Notes
  - All monetary values are stored as decimal for precision
  - JSONB is used for flexible document storage in claims
  - Foreign key constraints ensure data integrity
  - Indexes are added on frequently queried columns
*/

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'agent', 'manager')),
  phone text,
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referred_by_agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  date_of_birth date,
  address text,
  created_at timestamptz DEFAULT now()
);

-- Create policies table
CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_number text UNIQUE NOT NULL,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  policy_type text NOT NULL CHECK (policy_type IN ('life', 'health', 'auto', 'home', 'business')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  premium_amount decimal(10, 2) NOT NULL,
  coverage_amount decimal(12, 2),
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number text UNIQUE NOT NULL,
  policy_id uuid NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  claim_amount decimal(10, 2) NOT NULL,
  approved_amount decimal(10, 2),
  description text NOT NULL,
  document_urls jsonb DEFAULT '[]'::jsonb,
  filed_date timestamptz DEFAULT now(),
  resolved_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create commissions table
CREATE TABLE IF NOT EXISTS commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  policy_id uuid REFERENCES policies(id) ON DELETE SET NULL,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amount decimal(10, 2) NOT NULL,
  commission_type text NOT NULL CHECK (commission_type IN ('referral', 'renewal', 'bonus')),
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_date date,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_agent ON clients(referred_by_agent_id);
CREATE INDEX IF NOT EXISTS idx_policies_client ON policies(client_id);
CREATE INDEX IF NOT EXISTS idx_policies_agent ON policies(agent_id);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_claims_policy ON claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_claims_agent ON claims(agent_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_commissions_agent ON commissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_commissions_month_year ON commissions(month, year);

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agents table
CREATE POLICY "Agents can view their own profile"
  ON agents FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all agents"
  ON agents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = auth.uid()
      AND agents.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert agents"
  ON agents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = auth.uid()
      AND agents.role = 'admin'
    )
  );

CREATE POLICY "Agents can update own profile"
  ON agents FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for clients table
CREATE POLICY "Agents can view their referred clients"
  ON clients FOR SELECT
  TO authenticated
  USING (
    referred_by_agent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = auth.uid()
      AND agents.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Agents can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (referred_by_agent_id = auth.uid());

CREATE POLICY "Agents can update their referred clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (
    referred_by_agent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = auth.uid()
      AND agents.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    referred_by_agent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = auth.uid()
      AND agents.role IN ('admin', 'manager')
    )
  );

-- RLS Policies for policies table
CREATE POLICY "Agents can view their policies"
  ON policies FOR SELECT
  TO authenticated
  USING (
    agent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = auth.uid()
      AND agents.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Agents can insert policies"
  ON policies FOR INSERT
  TO authenticated
  WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Agents can update their policies"
  ON policies FOR UPDATE
  TO authenticated
  USING (
    agent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = auth.uid()
      AND agents.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    agent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = auth.uid()
      AND agents.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Agents can delete their policies"
  ON policies FOR DELETE
  TO authenticated
  USING (
    agent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = auth.uid()
      AND agents.role = 'admin'
    )
  );

-- RLS Policies for claims table
CREATE POLICY "Agents can view their claims"
  ON claims FOR SELECT
  TO authenticated
  USING (
    agent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = auth.uid()
      AND agents.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Agents can insert claims"
  ON claims FOR INSERT
  TO authenticated
  WITH CHECK (agent_id = auth.uid());

CREATE POLICY "Agents can update their claims"
  ON claims FOR UPDATE
  TO authenticated
  USING (
    agent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = auth.uid()
      AND agents.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    agent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = auth.uid()
      AND agents.role IN ('admin', 'manager')
    )
  );

-- RLS Policies for commissions table
CREATE POLICY "Agents can view their commissions"
  ON commissions FOR SELECT
  TO authenticated
  USING (
    agent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = auth.uid()
      AND agents.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "System can insert commissions"
  ON commissions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = auth.uid()
      AND agents.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins can update commissions"
  ON commissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = auth.uid()
      AND agents.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = auth.uid()
      AND agents.role = 'admin'
    )
  );