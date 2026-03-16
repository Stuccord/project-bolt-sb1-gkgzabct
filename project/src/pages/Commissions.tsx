import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { supabase, Commission } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CommissionWithClient extends Commission {
  client_name: string;
}

interface MonthlyTotal {
  month: number;
  year: number;
  total: number;
  count: number;
}

export default function Commissions() {
  const { agent } = useAuth();
  const [commissions, setCommissions] = useState<CommissionWithClient[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (agent) {
      fetchCommissions();
    }
  }, [agent, selectedYear]);

  const fetchCommissions = async () => {
    try {
      const { data, error } = await supabase
        .from('commissions')
        .select(`
          *,
          clients!inner(full_name)
        `)
        .eq('agent_id', agent!.id)
        .eq('year', selectedYear)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map((c: any) => ({
        ...c,
        client_name: c.clients.full_name,
      })) || [];

      setCommissions(formattedData);

      const monthlyData: Record<number, MonthlyTotal> = {};

      formattedData.forEach((comm) => {
        if (!monthlyData[comm.month]) {
          monthlyData[comm.month] = {
            month: comm.month,
            year: comm.year,
            total: 0,
            count: 0,
          };
        }
        monthlyData[comm.month].total += parseFloat(comm.amount.toString());
        monthlyData[comm.month].count += 1;
      });

      const monthlyArray = Object.values(monthlyData).sort((a, b) => a.month - b.month);
      setMonthlyTotals(monthlyArray);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `GHS ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMonthName = (monthNum: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNum - 1];
  };

  const currentMonth = new Date().getMonth() + 1;
  const currentMonthTotal = monthlyTotals.find((m) => m.month === currentMonth)?.total || 0;
  const totalYearCommissions = monthlyTotals.reduce((sum, m) => sum + m.total, 0);
  const totalPaidCommissions = commissions
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);

  const getStatusBadgeColor = (status: string) => {
    return status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      referral: 'bg-blue-100 text-blue-700',
      renewal: 'bg-purple-100 text-purple-700',
      bonus: 'bg-amber-100 text-amber-700',
    };
    return colors[type] || colors.referral;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Commissions</h1>
          <p className="text-gray-600">Track your earnings and commission history</p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {[2024, 2025, 2026, 2027].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-100 text-sm font-medium">Current Month</p>
            <Calendar className="w-8 h-8 text-purple-200" />
          </div>
          <p className="text-4xl font-bold mb-1">{formatCurrency(currentMonthTotal)}</p>
          <p className="text-purple-200 text-sm">{getMonthName(currentMonth)} {selectedYear}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">Total Year Earnings</p>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-1">{formatCurrency(totalYearCommissions)}</p>
          <p className="text-gray-500 text-sm">{selectedYear}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">Total Paid</p>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-1">{formatCurrency(totalPaidCommissions)}</p>
          <p className="text-gray-500 text-sm">All time</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthlyTotals.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-8">
              No commissions recorded for {selectedYear}
            </p>
          ) : (
            monthlyTotals.map((monthly) => (
              <div
                key={monthly.month}
                className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors"
              >
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {getMonthName(monthly.month)}
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {formatCurrency(monthly.total)}
                </p>
                <p className="text-xs text-gray-500">{monthly.count} transactions</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Commission History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No commission history for {selectedYear}
                  </td>
                </tr>
              ) : (
                commissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(commission.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{commission.client_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeColor(
                          commission.commission_type
                        )}`}
                      >
                        {commission.commission_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(parseFloat(commission.amount.toString()))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          commission.status
                        )}`}
                      >
                        {commission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(commission.paid_date)}
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
