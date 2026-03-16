import React, { useEffect, useState } from 'react';
import { Users, Shield, Clock, DollarSign } from 'lucide-react';
import StatCard from '../components/StatCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  totalClients: number;
  activePolicies: number;
  pendingItems: number;
  monthlyCommission: number;
}

interface ClientReferral {
  id: string;
  client_name: string;
  policy_type: string;
  policy_status: string;
  date_referred: string;
  commission: number;
}

export default function Dashboard() {
  const { agent } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activePolicies: 0,
    pendingItems: 0,
    monthlyCommission: 0,
  });
  const [recentReferrals, setRecentReferrals] = useState<ClientReferral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (agent) {
      fetchDashboardData();
    }
  }, [agent]);

  const fetchDashboardData = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const [clientsRes, policiesRes, pendingPoliciesRes, claimsRes, commissionsRes] = await Promise.all([
        supabase
          .from('clients')
          .select('id', { count: 'exact' })
          .eq('referred_by_agent_id', agent!.id),
        supabase
          .from('policies')
          .select('id', { count: 'exact' })
          .eq('agent_id', agent!.id)
          .eq('status', 'active'),
        supabase
          .from('policies')
          .select('id', { count: 'exact' })
          .eq('agent_id', agent!.id)
          .eq('status', 'pending'),
        supabase
          .from('claims')
          .select('id', { count: 'exact' })
          .eq('agent_id', agent!.id)
          .eq('status', 'pending'),
        supabase
          .from('commissions')
          .select('amount')
          .eq('agent_id', agent!.id)
          .eq('month', currentMonth)
          .eq('year', currentYear),
      ]);

      const totalCommission = commissionsRes.data?.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0) || 0;

      setStats({
        totalClients: clientsRes.count || 0,
        activePolicies: policiesRes.count || 0,
        pendingItems: (pendingPoliciesRes.count || 0) + (claimsRes.count || 0),
        monthlyCommission: totalCommission,
      });

      const { data: referralsData } = await supabase
        .from('policies')
        .select(`
          id,
          policy_type,
          status,
          created_at,
          clients!inner(full_name),
          commissions(amount)
        `)
        .eq('agent_id', agent!.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const formattedReferrals = referralsData?.map((ref: any) => ({
        id: ref.id,
        client_name: ref.clients.full_name,
        policy_type: ref.policy_type,
        policy_status: ref.status,
        date_referred: ref.created_at,
        commission: ref.commissions[0]?.amount || 0,
      })) || [];

      setRecentReferrals(formattedReferrals);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `GHS ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-indigo-100 text-indigo-700',
      expired: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Track your referrals, policies, and commissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients Referred"
          value={stats.totalClients}
          icon={Users}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Active Policies"
          value={stats.activePolicies}
          icon={Shield}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Pending Items"
          value={stats.pendingItems}
          icon={Clock}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Monthly Commission"
          value={formatCurrency(stats.monthlyCommission)}
          icon={DollarSign}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Recent Client Referrals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Policy Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Referred
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {recentReferrals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No referrals yet. Start by adding your first client!
                  </td>
                </tr>
              ) : (
                recentReferrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{referral.client_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{referral.policy_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          referral.policy_status
                        )}`}
                      >
                        {referral.policy_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(referral.date_referred)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(referral.commission)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
