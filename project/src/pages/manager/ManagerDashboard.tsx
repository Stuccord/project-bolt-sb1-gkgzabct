import React, { useEffect, useState } from 'react';
import { Users, Shield, DollarSign, TrendingUp, Award, Target } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { supabase } from '../../lib/supabase';

interface ManagerStats {
  totalAgents: number;
  totalClients: number;
  activePolicies: number;
  monthlyCommissions: number;
  pendingClaims: number;
  teamPerformance: number;
}

interface AgentPerformance {
  agent_name: string;
  clients_count: number;
  policies_count: number;
  commissions_total: number;
}

export default function ManagerDashboard() {
  const [stats, setStats] = useState<ManagerStats>({
    totalAgents: 0,
    totalClients: 0,
    activePolicies: 0,
    monthlyCommissions: 0,
    pendingClaims: 0,
    teamPerformance: 0,
  });
  const [topAgents, setTopAgents] = useState<AgentPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerStats();
  }, []);

  const fetchManagerStats = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const [agentsRes, clientsRes, policiesRes, commissionsRes, claimsRes] = await Promise.all([
        supabase.from('agents').select('id', { count: 'exact' }).eq('role', 'agent'),
        supabase.from('clients').select('id', { count: 'exact' }),
        supabase.from('policies').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase
          .from('commissions')
          .select('amount')
          .eq('month', currentMonth)
          .eq('year', currentYear),
        supabase.from('claims').select('id', { count: 'exact' }).eq('status', 'pending'),
      ]);

      const totalCommissions = commissionsRes.data?.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0) || 0;

      setStats({
        totalAgents: agentsRes.count || 0,
        totalClients: clientsRes.count || 0,
        activePolicies: policiesRes.count || 0,
        monthlyCommissions: totalCommissions,
        pendingClaims: claimsRes.count || 0,
        teamPerformance: 87,
      });

      const { data: agentPerformance } = await supabase
        .from('agents')
        .select(`
          id,
          full_name,
          clients:clients(count),
          policies:policies(count),
          commissions:commissions(amount)
        `)
        .eq('role', 'agent')
        .limit(5);

      const formattedPerformance = agentPerformance?.map((agent: any) => ({
        agent_name: agent.full_name,
        clients_count: agent.clients[0]?.count || 0,
        policies_count: agent.policies[0]?.count || 0,
        commissions_total: agent.commissions?.reduce((sum: number, c: any) => sum + parseFloat(c.amount.toString()), 0) || 0,
      })) || [];

      setTopAgents(formattedPerformance);
    } catch (error) {
      console.error('Error fetching manager stats:', error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manager Dashboard</h1>
        <p className="text-gray-600">Team performance and oversight</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Team Size"
          value={stats.totalAgents}
          icon={Users}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={Target}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Active Policies"
          value={stats.activePolicies}
          icon={Shield}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Monthly Commissions"
          value={formatCurrency(stats.monthlyCommissions)}
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
        <StatCard
          title="Team Performance"
          value={`${stats.teamPerformance}%`}
          icon={Award}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performing Agents</h2>
          <div className="space-y-4">
            {topAgents.map((agent, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-700 font-semibold">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{agent.agent_name}</div>
                    <div className="text-sm text-gray-600">
                      {agent.clients_count} clients • {agent.policies_count} policies
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-purple-700">{formatCurrency(agent.commissions_total)}</div>
                  <div className="text-xs text-gray-500">Total commissions</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Team Insights</h2>
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900">Client Acquisition Rate</span>
                <span className="text-sm font-bold text-purple-700">+12%</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-indigo-900">Policy Conversion</span>
                <span className="text-sm font-bold text-indigo-700">78%</span>
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900">Customer Satisfaction</span>
                <span className="text-sm font-bold text-purple-700">92%</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
