import React, { useEffect, useState } from 'react';
import { Wallet, Plus, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface WithdrawalRequest {
  id: string;
  request_number: string;
  amount: number;
  payment_method: string;
  status: string;
  requested_date: string;
  processed_date: string | null;
  payment_reference: string | null;
  rejection_reason: string | null;
}

interface PaymentMethod {
  id: string;
  method_type: string;
  is_default: boolean;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  mobile_money_number: string | null;
  mobile_money_name: string | null;
  is_verified: boolean;
}

export default function Withdrawals() {
  const { agent } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);

  useEffect(() => {
    if (agent) {
      fetchData();
    }
  }, [agent]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchWithdrawals(),
        fetchPaymentMethods(),
        fetchAvailableBalance()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('rep_id', agent!.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching withdrawals:', error);
      return;
    }
    setWithdrawals(data || []);
  };

  const fetchPaymentMethods = async () => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('rep_id', agent!.id)
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Error fetching payment methods:', error);
      return;
    }
    setPaymentMethods(data || []);
  };

  const fetchAvailableBalance = async () => {
    const { data, error } = await supabase
      .from('referrals')
      .select('commission_amount')
      .eq('rep_id', agent!.id)
      .eq('status', 'paid')
      .eq('commission_paid', false);

    if (error) {
      console.error('Error fetching balance:', error);
      return;
    }

    const total = data?.reduce((sum, ref) => sum + parseFloat(ref.commission_amount || '0'), 0) || 0;
    setAvailableBalance(total);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
      case 'approved':
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return `GHS ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawals</h1>
          <p className="text-gray-600 mt-1">Manage your commission withdrawals</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          disabled={availableBalance <= 0}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Request Withdrawal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(availableBalance)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Withdrawals</p>
              <p className="text-2xl font-bold text-gray-900">
                {withdrawals.filter(w => ['pending', 'approved', 'processing'].includes(w.status)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Withdrawals</p>
              <p className="text-2xl font-bold text-gray-900">
                {withdrawals.filter(w => w.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {paymentMethods.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-yellow-800 font-medium">No payment method set up</p>
            <p className="text-yellow-700 text-sm mt-1">
              Please add a payment method before requesting a withdrawal
            </p>
            <button
              onClick={() => setShowAddMethodModal(true)}
              className="mt-2 text-sm text-yellow-800 font-medium hover:text-yellow-900"
            >
              Add Payment Method →
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Withdrawal History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No withdrawal requests yet
                  </td>
                </tr>
              ) : (
                withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {withdrawal.request_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(withdrawal.requested_date)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(withdrawal.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatPaymentMethod(withdrawal.payment_method)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(withdrawal.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                          {withdrawal.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {withdrawal.payment_reference || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WithdrawalRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        availableBalance={availableBalance}
        paymentMethods={paymentMethods}
        onSuccess={() => {
          fetchData();
          setShowRequestModal(false);
        }}
      />

      <AddPaymentMethodModal
        isOpen={showAddMethodModal}
        onClose={() => setShowAddMethodModal(false)}
        onSuccess={() => {
          fetchPaymentMethods();
          setShowAddMethodModal(false);
        }}
      />
    </div>
  );
}

function WithdrawalRequestModal({ isOpen, onClose, availableBalance, paymentMethods, onSuccess }: any) {
  const { agent } = useAuth();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const withdrawalAmount = parseFloat(amount);
    if (withdrawalAmount <= 0 || withdrawalAmount > availableBalance) {
      setError('Invalid withdrawal amount');
      return;
    }

    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);

    try {
      const method = paymentMethods.find((m: PaymentMethod) => m.id === selectedMethod);

      const { error: insertError } = await supabase
        .from('withdrawal_requests')
        .insert({
          rep_id: agent!.id,
          amount: withdrawalAmount,
          payment_method: method.method_type,
          bank_name: method.bank_name,
          account_number: method.account_number,
          account_name: method.account_name,
          mobile_money_number: method.mobile_money_number,
          mobile_money_name: method.mobile_money_name,
          request_number: ''
        });

      if (insertError) throw insertError;

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Request Withdrawal</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Balance: GHS {availableBalance.toFixed(2)}
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={availableBalance}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              required
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select method</option>
              {paymentMethods.map((method: PaymentMethod) => (
                <option key={method.id} value={method.id}>
                  {method.method_type === 'bank_transfer'
                    ? `${method.bank_name} - ${method.account_number}`
                    : `${method.method_type} - ${method.mobile_money_number}`
                  }
                  {method.is_default && ' (Default)'}
                </option>
              ))}
            </select>
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
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddPaymentMethodModal({ isOpen, onClose, onSuccess }: any) {
  const { agent } = useAuth();
  const [methodType, setMethodType] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileName, setMobileName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('payment_methods')
        .insert({
          rep_id: agent!.id,
          method_type: methodType,
          bank_name: methodType === 'bank_transfer' ? bankName : null,
          account_number: methodType === 'bank_transfer' ? accountNumber : null,
          account_name: methodType === 'bank_transfer' ? accountName : null,
          mobile_money_number: methodType !== 'bank_transfer' ? mobileNumber : null,
          mobile_money_name: methodType !== 'bank_transfer' ? mobileName : null,
          is_default: isDefault
        });

      if (insertError) throw insertError;

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add Payment Method</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method Type
            </label>
            <select
              required
              value={methodType}
              onChange={(e) => setMethodType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select type</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mtn_momo">MTN Mobile Money</option>
              <option value="vodafone_cash">Vodafone Cash</option>
              <option value="airteltigo_money">AirtelTigo Money</option>
            </select>
          </div>

          {methodType === 'bank_transfer' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., GCB Bank"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Account holder name"
                />
              </div>
            </>
          ) : methodType ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Money Number</label>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 0244123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                <input
                  type="text"
                  required
                  value={mobileName}
                  onChange={(e) => setMobileName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Registered name"
                />
              </div>
            </>
          ) : null}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">
              Set as default payment method
            </label>
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
              {loading ? 'Adding...' : 'Add Method'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
