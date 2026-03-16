import React, { useEffect, useState } from 'react';
import { Search, Filter, Edit2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Referral {
  id: string;
  case_number: string;
  rep_id: string;
  client_name: string;
  client_phone: string;
  hospital: string;
  injured_or_deceased: string;
  accident_date: string;
  status: string;
  assigned_lawyer: string | null;
  assigned_doctor: string | null;
  claim_amount: number | null;
  commission_amount: number | null;
  payment_date: string | null;
  notes: string | null;
  created_at: string;
  agents: { full_name: string } | null;
}

export default function ReferralManagement() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*, agents(full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (referral: Referral) => {
    setEditingId(referral.id);
    setEditData({
      status: referral.status,
      assigned_lawyer: referral.assigned_lawyer || '',
      assigned_doctor: referral.assigned_doctor || '',
      payment_date: referral.payment_date || '',
      notes: referral.notes || '',
    });
  };

  const handleSave = async (id: string) => {
    try {
      const updateData: any = {
        status: editData.status,
        assigned_lawyer: editData.assigned_lawyer || null,
        assigned_doctor: editData.assigned_doctor || null,
        notes: editData.notes || null,
      };

      if (editData.status === 'paid' && editData.payment_date) {
        updateData.payment_date = editData.payment_date;
        updateData.commission_paid = true;
      }

      const { error } = await supabase
        .from('referrals')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      alert('Referral updated successfully!');
      setEditingId(null);
      fetchReferrals();
    } catch (error: any) {
      console.error('Error updating referral:', error);
      alert('Error updating referral: ' + error.message);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
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
      awaiting_payment: 'bg-purple-100 text-purple-700',
      in_review: 'bg-fuchsia-100 text-fuchsia-700',
      submitted: 'bg-indigo-100 text-indigo-700',
      paid: 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredReferrals = referrals.filter((ref) => {
    const matchesSearch =
      ref.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ref.agents?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || ref.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Management</h1>
        <p className="text-gray-600">Manage all referral cases and update case status</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by case number, client name, or rep name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="awaiting_police_report">Awaiting Police Report</option>
              <option value="in_review">In Review</option>
              <option value="submitted">Submitted</option>
              <option value="awaiting_payment">Awaiting Payment</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rep
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredReferrals.map((referral) => (
                <tr key={referral.id} className="hover:bg-gray-50 transition-colors">
                  {editingId === referral.id ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-purple-900">{referral.case_number}</div>
                        <div className="text-xs text-gray-500">{formatDate(referral.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {referral.agents?.full_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{referral.client_name}</div>
                        <div className="text-xs text-gray-500">{referral.injured_or_deceased}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={editData.status}
                          onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="awaiting_police_report">Awaiting Police Report</option>
                          <option value="in_review">In Review</option>
                          <option value="submitted">Submitted</option>
                          <option value="awaiting_payment">Awaiting Payment</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          placeholder="Lawyer"
                          value={editData.assigned_lawyer}
                          onChange={(e) => setEditData({ ...editData, assigned_lawyer: e.target.value })}
                          className="w-full text-xs px-2 py-1 border border-gray-300 rounded mb-1"
                        />
                        <input
                          type="text"
                          placeholder="Doctor"
                          value={editData.assigned_doctor}
                          onChange={(e) => setEditData({ ...editData, assigned_doctor: e.target.value })}
                          className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {referral.commission_amount ? formatCurrency(referral.commission_amount) : <span className="text-gray-400">Pending</span>}
                        </div>
                        {editData.status === 'paid' && (
                          <input
                            type="date"
                            value={editData.payment_date}
                            onChange={(e) => setEditData({ ...editData, payment_date: e.target.value })}
                            className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSave(referral.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-purple-900">{referral.case_number}</div>
                        <div className="text-xs text-gray-500">{formatDate(referral.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {referral.agents?.full_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{referral.client_name}</div>
                        <div className="text-xs text-gray-500">{referral.injured_or_deceased}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(referral.status)}`}>
                          {formatStatus(referral.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-900">{referral.assigned_lawyer || '-'}</div>
                        <div className="text-xs text-gray-500">{referral.assigned_doctor || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {referral.commission_amount ? formatCurrency(referral.commission_amount) : <span className="text-gray-400">Pending</span>}
                        </div>
                        {referral.status === 'paid' && (
                          <div className="text-xs text-green-600">Paid</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(referral)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredReferrals.length} of {referrals.length} referrals
        </div>
      </div>
    </div>
  );
}
