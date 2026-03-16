import React, { useState } from 'react';
import { UserPlus, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function NewClient() {
  const { agent } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [clientData, setClientData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
  });

  const [policyData, setPolicyData] = useState({
    policy_type: 'life',
    premium_amount: '',
    coverage_amount: '',
    start_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert([
          {
            ...clientData,
            referred_by_agent_id: agent!.id,
            date_of_birth: clientData.date_of_birth || null,
          },
        ])
        .select()
        .single();

      if (clientError) throw clientError;

      const policyNumber = `POL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const { error: policyError } = await supabase.from('policies').insert([
        {
          policy_number: policyNumber,
          client_id: client.id,
          agent_id: agent!.id,
          policy_type: policyData.policy_type,
          status: 'pending',
          premium_amount: parseFloat(policyData.premium_amount),
          coverage_amount: policyData.coverage_amount ? parseFloat(policyData.coverage_amount) : null,
          start_date: policyData.start_date || null,
        },
      ]);

      if (policyError) throw policyError;

      const commissionAmount = parseFloat(policyData.premium_amount) * 0.1;
      const currentDate = new Date();

      await supabase.from('commissions').insert([
        {
          agent_id: agent!.id,
          client_id: client.id,
          amount: commissionAmount,
          commission_type: 'referral',
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
          status: 'pending',
        },
      ]);

      setSuccess(true);
      setClientData({
        full_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        address: '',
      });
      setPolicyData({
        policy_type: 'life',
        premium_amount: '',
        coverage_amount: '',
        start_date: '',
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to create client referral');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
          <UserPlus className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Client Referral</h1>
          <p className="text-gray-600">Add a new client and create their policy</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
          Client referral created successfully! Commission has been recorded.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={clientData.full_name}
                onChange={(e) => setClientData({ ...clientData, full_name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={clientData.email}
                onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={clientData.phone}
                onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="+233 XX XXX XXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                value={clientData.date_of_birth}
                onChange={(e) => setClientData({ ...clientData, date_of_birth: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={clientData.address}
                onChange={(e) => setClientData({ ...clientData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Client's full address"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Policy Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Policy Type</label>
              <select
                value={policyData.policy_type}
                onChange={(e) => setPolicyData({ ...policyData, policy_type: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="life">Life Insurance</option>
                <option value="health">Health Insurance</option>
                <option value="auto">Auto Insurance</option>
                <option value="home">Home Insurance</option>
                <option value="business">Business Insurance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Premium Amount (GHS)
              </label>
              <input
                type="number"
                step="0.01"
                value={policyData.premium_amount}
                onChange={(e) => setPolicyData({ ...policyData, premium_amount: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="5000.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coverage Amount (GHS)
              </label>
              <input
                type="number"
                step="0.01"
                value={policyData.coverage_amount}
                onChange={(e) => setPolicyData({ ...policyData, coverage_amount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="100000.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={policyData.start_date}
                onChange={(e) => setPolicyData({ ...policyData, start_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-purple-50 rounded-xl">
            <p className="text-sm text-purple-900">
              <span className="font-semibold">Estimated Commission:</span>{' '}
              GHS {(parseFloat(policyData.premium_amount) * 0.1 || 0).toFixed(2)} (10% of premium)
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setClientData({
                full_name: '',
                email: '',
                phone: '',
                date_of_birth: '',
                address: '',
              });
              setPolicyData({
                policy_type: 'life',
                premium_amount: '',
                coverage_amount: '',
                start_date: '',
              });
            }}
            className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Creating...' : 'Create Referral'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
