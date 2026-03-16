/*
  # Add Foreign Key Indexes for Query Performance

  ## Purpose
  Add covering indexes for all foreign key columns to optimize JOIN operations
  and improve overall query performance.

  ## Changes
  - Add indexes for all foreign key columns across all tables
  - These indexes significantly improve query performance for:
    - JOIN operations
    - Foreign key constraint checks
    - Filtering by related entities

  ## Tables Affected
  - claims (agent_id, client_id, policy_id)
  - clients (referred_by_agent_id)
  - commissions (agent_id, client_id, policy_id)
  - documents (uploaded_by)
  - notifications (created_by, recipient_id)
  - payment_methods (rep_id)
  - policies (agent_id, client_id)
  - referrals (rep_id)
  - support_tickets (rep_id)
  - withdrawal_requests (rep_id, processed_by)
*/

-- =====================================================
-- CLAIMS TABLE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_claims_agent_id 
  ON claims(agent_id);

CREATE INDEX IF NOT EXISTS idx_claims_client_id 
  ON claims(client_id);

CREATE INDEX IF NOT EXISTS idx_claims_policy_id 
  ON claims(policy_id);

-- =====================================================
-- CLIENTS TABLE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_clients_referred_by_agent_id 
  ON clients(referred_by_agent_id);

-- =====================================================
-- COMMISSIONS TABLE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_commissions_agent_id 
  ON commissions(agent_id);

CREATE INDEX IF NOT EXISTS idx_commissions_client_id 
  ON commissions(client_id);

CREATE INDEX IF NOT EXISTS idx_commissions_policy_id 
  ON commissions(policy_id);

-- =====================================================
-- DOCUMENTS TABLE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by 
  ON documents(uploaded_by);

-- =====================================================
-- NOTIFICATIONS TABLE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_notifications_created_by 
  ON notifications(created_by);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id 
  ON notifications(recipient_id);

-- =====================================================
-- PAYMENT METHODS TABLE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_payment_methods_rep_id 
  ON payment_methods(rep_id);

-- =====================================================
-- POLICIES TABLE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_policies_agent_id 
  ON policies(agent_id);

CREATE INDEX IF NOT EXISTS idx_policies_client_id 
  ON policies(client_id);

-- =====================================================
-- REFERRALS TABLE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_referrals_rep_id 
  ON referrals(rep_id);

-- =====================================================
-- SUPPORT TICKETS TABLE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_support_tickets_rep_id 
  ON support_tickets(rep_id);

-- =====================================================
-- WITHDRAWAL REQUESTS TABLE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_rep_id 
  ON withdrawal_requests(rep_id);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_processed_by 
  ON withdrawal_requests(processed_by);