import React, { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Award, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeaderboardEntry {
  rep_id: string;
  rep_name: string;
  total_referrals: number;
  successful_claims: number;
  total_commission: number;
  success_rate: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'all'>('month');

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      let query = supabase
        .from('referrals')
        .select('rep_id, status, commission_amount, agents(full_name)');

      if (period === 'month') {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        query = query.gte('created_at', startOfMonth.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const groupedData = data.reduce((acc: any, ref: any) => {
        const repId = ref.rep_id;
        if (!acc[repId]) {
          acc[repId] = {
            rep_id: repId,
            rep_name: ref.agents?.full_name || 'Unknown',
            total_referrals: 0,
            successful_claims: 0,
            total_commission: 0,
          };
        }

        acc[repId].total_referrals += 1;
        if (ref.status === 'paid') {
          acc[repId].successful_claims += 1;
          acc[repId].total_commission += parseFloat(ref.commission_amount?.toString() || '0');
        }

        return acc;
      }, {});

      const leaderboardData: LeaderboardEntry[] = Object.values(groupedData).map((entry: any) => ({
        ...entry,
        success_rate: entry.total_referrals > 0 ? (entry.successful_claims / entry.total_referrals) * 100 : 0,
      }));

      leaderboardData.sort((a, b) => b.successful_claims - a.successful_claims);

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `GHS ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-purple-500" />;
      case 2:
        return <Award className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Award className="w-8 h-8 text-amber-600" />;
      default:
        return <Star className="w-8 h-8 text-gray-300" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-white border border-gray-200 text-gray-700';
    }
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Top Performers</h1>
          <p className="text-gray-600">Leaderboard of successful referral representatives</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === 'month'
                ? 'bg-blue-900 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === 'all'
                ? 'bg-blue-900 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No leaderboard data available yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.slice(0, 5).map((entry, index) => {
            const rank = index + 1;
            return (
              <div
                key={entry.rep_id}
                className={`rounded-2xl shadow-sm p-6 ${getRankColor(rank)} transition-transform hover:scale-105`}
              >
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl font-bold w-12 text-center">#{rank}</div>
                    <div>{getMedalIcon(rank)}</div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{entry.rep_name}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm opacity-80">Total Referrals</div>
                        <div className="text-xl font-semibold">{entry.total_referrals}</div>
                      </div>
                      <div>
                        <div className="text-sm opacity-80">Successful Claims</div>
                        <div className="text-xl font-semibold flex items-center space-x-2">
                          <span>{entry.successful_claims}</span>
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm opacity-80">Success Rate</div>
                        <div className="text-xl font-semibold">{entry.success_rate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-sm opacity-80">Total Commission</div>
                        <div className="text-xl font-semibold">{formatCurrency(entry.total_commission)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {leaderboard.length > 5 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Top Performers</h3>
              <div className="space-y-3">
                {leaderboard.slice(5).map((entry, index) => {
                  const rank = index + 6;
                  return (
                    <div key={entry.rep_id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center space-x-4">
                        <div className="text-lg font-semibold text-gray-600 w-8">#{rank}</div>
                        <div>
                          <div className="font-medium text-gray-900">{entry.rep_name}</div>
                          <div className="text-sm text-gray-500">{entry.successful_claims} successful claims</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatCurrency(entry.total_commission)}</div>
                        <div className="text-sm text-gray-500">{entry.success_rate.toFixed(1)}% success rate</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Trophy className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">How Rankings Work</h3>
            <p className="text-sm text-blue-800">
              Rankings are based on the number of <strong>successfully paid claims</strong>. The more cases you complete
              with successful payouts, the higher you rank. Keep submitting quality referrals and following up on your
              cases to climb the leaderboard!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
