import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, Upload, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Policy {
  id: string;
  policy_number: string;
  policy_type: string;
  client_id: string;
  client_name: string;
  status: string;
}

export default function FileClaim({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { agent } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    policy_id: '',
    client_id: '',
    claim_amount: '',
    description: '',
    incident_date: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (agent) {
      fetchPolicies();
    }
  }, [agent]);

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .select(`
          id,
          policy_number,
          policy_type,
          client_id,
          status,
          clients!inner(full_name)
        `)
        .eq('agent_id', agent!.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPolicies = data?.map((p: any) => ({
        id: p.id,
        policy_number: p.policy_number,
        policy_type: p.policy_type,
        client_id: p.client_id,
        client_name: p.clients.full_name,
        status: p.status,
      })) || [];

      setPolicies(formattedPolicies);
    } catch (error) {
      console.error('Error fetching policies:', error);
      alert('Failed to load policies');
    }
  };

  const handlePolicyChange = (policyId: string) => {
    const selectedPolicy = policies.find((p) => p.id === policyId);
    if (selectedPolicy) {
      setFormData({
        ...formData,
        policy_id: policyId,
        client_id: selectedPolicy.client_id,
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.policy_id) newErrors.policy_id = 'Please select a policy';
    if (!formData.claim_amount || parseFloat(formData.claim_amount) <= 0) {
      newErrors.claim_amount = 'Please enter a valid claim amount';
    }
    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Please provide a detailed description (at least 10 characters)';
    }
    if (!formData.incident_date) newErrors.incident_date = 'Please select the incident date';

    const incidentDate = new Date(formData.incident_date);
    const today = new Date();
    if (incidentDate > today) {
      newErrors.incident_date = 'Incident date cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const claimNumber = `CLM-${Date.now().toString().slice(-8)}`;

      const { data, error } = await supabase.from('claims').insert([
        {
          claim_number: claimNumber,
          policy_id: formData.policy_id,
          client_id: formData.client_id,
          agent_id: agent!.id,
          claim_amount: parseFloat(formData.claim_amount),
          description: formData.description.trim(),
          incident_date: formData.incident_date,
          filed_date: new Date().toISOString(),
          status: 'pending',
        },
      ]).select();

      if (error) throw error;

      setSuccess(true);
      setFormData({
        policy_id: '',
        client_id: '',
        claim_amount: '',
        description: '',
        incident_date: '',
      });

      setTimeout(() => {
        onNavigate('claims');
      }, 2000);
    } catch (error: any) {
      console.error('Error filing claim:', error);
      setErrors({ submit: error.message || 'Failed to file claim. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onNavigate('claims')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">File New Claim</h1>
          <p className="text-gray-600">Submit a claim for one of your active policies</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900">Claim filed successfully!</h3>
            <p className="text-sm text-green-700 mt-1">
              Your claim has been submitted and is pending review. Redirecting...
            </p>
          </div>
        </div>
      )}

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Policy <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.policy_id}
              onChange={(e) => handlePolicyChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.policy_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Choose a policy...</option>
              {policies.map((policy) => (
                <option key={policy.id} value={policy.id}>
                  {policy.policy_number} - {policy.client_name} ({policy.policy_type})
                </option>
              ))}
            </select>
            {errors.policy_id && <p className="text-red-500 text-sm mt-1">{errors.policy_id}</p>}
            {policies.length === 0 && (
              <p className="text-amber-600 text-sm mt-2">
                No active policies found. Please ensure you have active policies before filing a claim.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Incident Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.incident_date}
              onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.incident_date ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.incident_date && <p className="text-red-500 text-sm mt-1">{errors.incident_date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Claim Amount (GHS) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.claim_amount}
              onChange={(e) => setFormData({ ...formData, claim_amount: e.target.value })}
              placeholder="Enter claim amount"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.claim_amount ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.claim_amount && <p className="text-red-500 text-sm mt-1">{errors.claim_amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide detailed information about the incident and damages..."
              rows={6}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            <p className="text-sm text-gray-500 mt-2">
              {formData.description.length} characters (minimum 10 required)
            </p>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <h3 className="font-semibold text-indigo-900 mb-2">Important Information</h3>
            <ul className="text-sm text-indigo-800 space-y-1 list-disc list-inside">
              <li>Ensure all information provided is accurate and complete</li>
              <li>Claims are reviewed within 5-7 business days</li>
              <li>You will be notified of the claim status via email</li>
              <li>Supporting documents may be requested during review</li>
            </ul>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading || policies.length === 0}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Filing Claim...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>File Claim</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('claims')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
