import React, { useEffect, useState } from 'react';
import { Users, Clock, CheckCircle, DollarSign } from 'lucide-react';
import StatCard from '../components/StatCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ReferralStats {
  totalReferrals: number;
  pendingCases: number;
  completedCases: number;
  commissionEarned: number;
}

interface RecentReferral {
  id: string;
  case_number: string;
  client_name: string;
  hospital: string;
  injured_or_deceased: string;
  status: string;
  commission_amount: number | null;
  created_at: string;
}

export default function ReferralDashboard() {
  const { agent } = useAuth();
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    pendingCases: 0,
    completedCases: 0,
    commissionEarned: 0,
  });
  const [recentReferrals, setRecentReferrals] = useState<RecentReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState('');

  useEffect(() => {
    if (agent) {
      fetchDashboardData();
    }
  }, [agent]);

  const fetchDashboardData = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const monthName = new Date().toLocaleString('default', { month: 'long' });

      const [totalRes, pendingRes, completedRes, commissionsRes, recentRes] = await Promise.all([
        supabase
          .from('referrals')
          .select('id', { count: 'exact' })
          .eq('rep_id', agent!.id),
        supabase
          .from('referrals')
          .select('id', { count: 'exact' })
          .eq('rep_id', agent!.id)
          .in('status', ['awaiting_police_report', 'awaiting_payment', 'in_review', 'submitted']),
        supabase
          .from('referrals')
          .select('id', { count: 'exact' })
          .eq('rep_id', agent!.id)
          .eq('status', 'paid'),
        supabase
          .from('referrals')
          .select('commission_amount, payment_date')
          .eq('rep_id', agent!.id)
          .eq('commission_paid', true)
          .gte('payment_date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
          .lt('payment_date', `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`),
        supabase
          .from('referrals')
          .select('*')
          .eq('rep_id', agent!.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const totalCommission = commissionsRes.data?.reduce(
        (sum, r) => sum + parseFloat(r.commission_amount?.toString() || '0'),
        0
      ) || 0;

      setStats({
        totalReferrals: totalRes.count || 0,
        pendingCases: pendingRes.count || 0,
        completedCases: completedRes.count || 0,
        commissionEarned: totalCommission,
      });
      setCurrentMonth(monthName);

      setRecentReferrals(recentRes.data || []);
    } catch (error) {
      console.error('Error fetching referral dashboard data:', error);
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
      awaiting_police_report: 'bg-yellow-100 text-yellow-700',
      awaiting_payment: 'bg-indigo-100 text-indigo-700',
      in_review: 'bg-blue-100 text-blue-700',
      submitted: 'bg-indigo-100 text-indigo-700',
      paid: 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Rep Dashboard</h1>
        <p className="text-gray-600">Track your victim referrals and commission earnings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Referrals"
          value={stats.totalReferrals}
          icon={Users}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-900"
        />
        <StatCard
          title="Pending Cases"
          value={stats.pendingCases}
          icon={Clock}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-700"
        />
        <StatCard
          title="Completed Cases"
          value={stats.completedCases}
          icon={CheckCircle}
          iconBgColor="bg-green-100"
          iconColor="text-green-700"
        />
        <StatCard
          title={`${currentMonth} Commission`}
          value={formatCurrency(stats.commissionEarned)}
          icon={DollarSign}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Recent Referrals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hospital
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Injured/Deceased
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {recentReferrals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No referrals yet. Submit your first case!
                  </td>
                </tr>
              ) : (
                recentReferrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-900">{referral.case_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{referral.client_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{referral.hospital}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{referral.injured_or_deceased}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          referral.status
                        )}`}
                      >
                        {formatStatus(referral.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {referral.commission_amount ? formatCurrency(parseFloat(referral.commission_amount.toString())) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(referral.created_at)}
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
