import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Agent = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'agent' | 'manager';
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type Client = {
  id: string;
  referred_by_agent_id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  address: string | null;
  created_at: string;
};

export type Policy = {
  id: string;
  policy_number: string;
  client_id: string;
  agent_id: string;
  policy_type: 'life' | 'health' | 'auto' | 'home' | 'business';
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  premium_amount: number;
  coverage_amount: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Claim = {
  id: string;
  claim_number: string;
  policy_id: string;
  client_id: string;
  agent_id: string;
  status: 'pending' | 'approved' | 'rejected';
  claim_amount: number;
  approved_amount: number | null;
  description: string;
  document_urls: string[];
  filed_date: string;
  resolved_date: string | null;
  created_at: string;
};

export type Commission = {
  id: string;
  agent_id: string;
  policy_id: string | null;
  client_id: string;
  amount: number;
  commission_type: 'referral' | 'renewal' | 'bonus';
  month: number;
  year: number;
  status: 'pending' | 'paid';
  paid_date: string | null;
  created_at: string;
};
