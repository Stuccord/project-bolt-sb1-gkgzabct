import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface WithdrawalRequest {
  id: string;
  request_number: string;
  rep_id: string;
  amount: number;
  payment_method: string;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  mobile_money_number: string | null;
  mobile_money_name: string | null;
  status: string;
  requested_date: string;
  processed_date: string | null;
  payment_reference: string | null;
  rejection_reason: string | null;
  notes: string | null;
  agents: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export default function WithdrawalProcessing() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, [filterStatus]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('withdrawal_requests')
        .select(`
          *,
          agents!withdrawal_requests_rep_id_fkey(full_name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-indigo-100 text-indigo-800', label: 'Approved' },
      processing: { color: 'bg-purple-100 text-purple-800', label: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };

    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return `GHS ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPaymentMethod = (method: string) => {
    const methods: Record<string, string> = {
      'bank_transfer': 'Bank Transfer',
      'mtn_momo': 'MTN Mobile Money',
      'vodafone_cash': 'Vodafone Cash',
      'airteltigo_money': 'AirtelTigo Money'
    };
    return methods[method] || method;
  };

  const totalPending = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + parseFloat(w.amount.toString()), 0);

  const totalCompleted = withdrawals
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + parseFloat(w.amount.toString()), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Withdrawal Processing</h1>
        <p className="text-gray-600 mt-1">Review and process rep withdrawal requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPending)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCompleted)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{withdrawals.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-2">
            {['pending', 'approved', 'processing', 'completed', 'rejected', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rep</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No withdrawal requests found
                  </td>
                </tr>
              ) : (
                withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {withdrawal.request_number}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{withdrawal.agents.full_name}</div>
                      <div className="text-xs text-gray-500">{withdrawal.agents.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(withdrawal.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{formatPaymentMethod(withdrawal.payment_method)}</div>
                      <div className="text-xs text-gray-500">
                        {withdrawal.payment_method === 'bank_transfer'
                          ? `${withdrawal.bank_name} - ${withdrawal.account_number}`
                          : withdrawal.mobile_money_number
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(withdrawal.requested_date)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedWithdrawal(withdrawal);
                          setShowProcessModal(true);
                        }}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        Process
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showProcessModal && selectedWithdrawal && (
        <ProcessWithdrawalModal
          withdrawal={selectedWithdrawal}
          onClose={() => {
            setShowProcessModal(false);
            setSelectedWithdrawal(null);
          }}
          onSuccess={() => {
            fetchWithdrawals();
            setShowProcessModal(false);
            setSelectedWithdrawal(null);
          }}
        />
      )}
    </div>
  );
}

function ProcessWithdrawalModal({ withdrawal, onClose, onSuccess }: any) {
  const { agent } = useAuth();
  const [action, setAction] = useState<'approve' | 'complete' | 'reject'>('approve');
  const [paymentReference, setPaymentReference] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let updateData: any = {
        processed_by: agent!.id,
        processed_date: new Date().toISOString(),
        notes
      };

      if (action === 'approve') {
        updateData.status = 'approved';
      } else if (action === 'complete') {
        if (!paymentReference) {
          setError('Payment reference is required');
          setLoading(false);
          return;
        }
        updateData.status = 'completed';
        updateData.payment_reference = paymentReference;

        const { error: updateReferralError } = await supabase
          .from('referrals')
          .update({ commission_paid: true })
          .eq('rep_id', withdrawal.rep_id)
          .eq('status', 'paid')
          .eq('commission_paid', false)
          .lte('commission_amount', withdrawal.amount);

        if (updateReferralError) throw updateReferralError;
      } else if (action === 'reject') {
        if (!rejectionReason) {
          setError('Rejection reason is required');
          setLoading(false);
          return;
        }
        updateData.status = 'rejected';
        updateData.rejection_reason = rejectionReason;
      }

      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update(updateData)
        .eq('id', withdrawal.id);

      if (updateError) throw updateError;

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Process Withdrawal Request</h3>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Request #:</span>
            <span className="font-semibold">{withdrawal.request_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rep:</span>
            <span className="font-semibold">{withdrawal.agents.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold text-purple-600">
              GHS {withdrawal.amount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Method:</span>
            <span className="font-semibold">
              {withdrawal.payment_method === 'bank_transfer'
                ? `Bank: ${withdrawal.bank_name} - ${withdrawal.account_number}`
                : `Mobile Money: ${withdrawal.mobile_money_number}`
              }
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="approve">Approve (Review Passed)</option>
              <option value="complete">Complete Payment (Mark as Paid)</option>
              <option value="reject">Reject Request</option>
            </select>
          </div>

          {action === 'complete' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Reference *
              </label>
              <input
                type="text"
                required
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Transaction ID or reference number"
              />
            </div>
          )}

          {action === 'reject' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Explain why this request is being rejected"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Add any additional notes"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
