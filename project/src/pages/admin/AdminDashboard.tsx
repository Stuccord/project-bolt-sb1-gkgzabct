import React, { useEffect, useState } from 'react';
import { Users, Shield, DollarSign, TrendingUp, UserCheck, UserX, Phone, Mail, MapPin } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { supabase } from '../../lib/supabase';

interface AdminStats {
  totalAgents: number;
  activeAgents: number;
  totalClients: number;
  totalPolicies: number;
  totalCommissions: number;
  pendingClaims: number;
}

interface Agent {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  hospital_affiliation: string | null;
  is_active: boolean;
  role: string;
  avatar_url: string | null;
  created_at: string;
}

interface AdminDashboardProps {
  onNavigate?: (page: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps = {}) {
  const [stats, setStats] = useState<AdminStats>({
    totalAgents: 0,
    activeAgents: 0,
    totalClients: 0,
    totalPolicies: 0,
    totalCommissions: 0,
    pendingClaims: 0,
  });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const [agentsRes, activeAgentsRes, clientsRes, policiesRes, commissionsRes, claimsRes, agentsListRes] = await Promise.all([
        supabase.from('agents').select('id', { count: 'exact', head: true }),
        supabase.from('agents').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('policies').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase
          .from('commissions')
          .select('amount')
          .eq('month', currentMonth)
          .eq('year', currentYear),
        supabase.from('claims').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase
          .from('agents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const totalCommissions = commissionsRes.data?.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0) || 0;

      setStats({
        totalAgents: agentsRes.count || 0,
        activeAgents: activeAgentsRes.count || 0,
        totalClients: clientsRes.count || 0,
        totalPolicies: policiesRes.count || 0,
        totalCommissions,
        pendingClaims: claimsRes.count || 0,
      });

      setAgents(agentsListRes.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `GHS ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">System-wide overview and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Agents"
          value={stats.totalAgents}
          icon={Users}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Active Agents"
          value={stats.activeAgents}
          icon={UserCheck}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={Users}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Active Policies"
          value={stats.totalPolicies}
          icon={Shield}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Monthly Commissions"
          value={formatCurrency(stats.totalCommissions)}
          icon={DollarSign}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Pending Claims"
          value={stats.pendingClaims}
          icon={TrendingUp}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate?.('agent-management')}
              className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <div className="font-semibold text-indigo-900">Manage Agents</div>
              <div className="text-sm text-indigo-600">View and manage all agents</div>
            </button>
            <button
              onClick={() => onNavigate?.('referral-management')}
              className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="font-semibold text-purple-900">Manage Referrals</div>
              <div className="text-sm text-purple-600">Review pending referrals</div>
            </button>
            <button
              onClick={() => onNavigate?.('withdrawal-processing')}
              className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <div className="font-semibold text-indigo-900">Process Withdrawals</div>
              <div className="text-sm text-indigo-600">Manage withdrawal requests</div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Health</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Agent Utilization</span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.totalAgents > 0 ? Math.round((stats.activeAgents / stats.totalAgents) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${stats.totalAgents > 0 ? (stats.activeAgents / stats.totalAgents) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Policy Conversion</span>
                <span className="text-sm font-semibold text-gray-900">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Claims Processing</span>
                <span className="text-sm font-semibold text-gray-900">72%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: '72%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">All Referral Reps</h2>
          <button
            onClick={() => onNavigate?.('agent-management')}
            className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rep</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hospital</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      {agent.avatar_url ? (
                        <img
                          src={agent.avatar_url}
                          alt={agent.full_name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-semibold text-sm">
                            {agent.full_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{agent.full_name}</div>
                        <div className="text-xs text-gray-500">ID: {agent.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{agent.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{agent.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{agent.hospital_affiliation || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {agent.is_active ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 capitalize">
                      {agent.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {agents.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No referral reps found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
