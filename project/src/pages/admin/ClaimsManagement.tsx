import React, { useEffect, useState } from 'react';
import {  Search, Filter, CheckCircle, XCircle, Clock, Eye, DollarSign, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ClaimWithDetails {
  id: string;
  claim_number: string;
  claim_amount: number;
  description: string;
  incident_date: string;
  filed_date: string;
  status: string;
  resolution_notes: string | null;
  agent_name: string;
  agent_email: string;
  client_name: string;
  policy_number: string;
  policy_type: string;
}

export default function ClaimsManagement() {
  const { agent } = useAuth();
  const [claims, setClaims] = useState<ClaimWithDetails[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<ClaimWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedClaim, setSelectedClaim] = useState<ClaimWithDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (agent?.role === 'admin') {
      fetchClaims();
    }
  }, [agent]);

  useEffect(() => {
    filterClaims();
  }, [claims, searchTerm, statusFilter]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          agents!claims_agent_id_fkey(full_name, email),
          clients!inner(full_name),
          policies!inner(policy_number, policy_type)
        `)
        .order('filed_date', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map((c: any) => ({
        id: c.id,
        claim_number: c.claim_number,
        claim_amount: c.claim_amount,
        description: c.description,
        incident_date: c.incident_date,
        filed_date: c.filed_date,
        status: c.status,
        resolution_notes: c.resolution_notes,
        agent_name: c.agents.full_name,
        agent_email: c.agents.email,
        client_name: c.clients.full_name,
        policy_number: c.policies.policy_number,
        policy_type: c.policies.policy_type,
      })) || [];

      setClaims(formattedData);
    } catch (error) {
      console.error('Error fetching claims:', error);
      alert('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const filterClaims = () => {
    let filtered = [...claims];

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.claim_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.policy_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    setFilteredClaims(filtered);
  };

  const openModal = (claim: ClaimWithDetails, action: 'approve' | 'reject') => {
    setSelectedClaim(claim);
    setActionType(action);
    setResolutionNotes('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClaim(null);
    setActionType(null);
    setResolutionNotes('');
  };

  const handleProcessClaim = async () => {
    if (!selectedClaim || !actionType) return;

    if (actionType === 'reject' && !resolutionNotes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      const newStatus = actionType === 'approve' ? 'approved' : 'rejected';

      const { error: updateError } = await supabase
        .from('claims')
        .update({
          status: newStatus,
          resolution_notes: resolutionNotes.trim() || null,
          resolved_date: new Date().toISOString(),
        })
        .eq('id', selectedClaim.id);

      if (updateError) throw updateError;

      if (actionType === 'approve') {
        const commissionAmount = selectedClaim.claim_amount * 0.10;

        const { error: commissionError } = await supabase.from('commissions').insert([
          {
            agent_id: (await supabase.from('claims').select('agent_id').eq('id', selectedClaim.id).single()).data?.agent_id,
            claim_id: selectedClaim.id,
            amount: commissionAmount,
            status: 'pending',
            earned_date: new Date().toISOString(),
          },
        ]);

        if (commissionError) {
          console.error('Error creating commission:', commissionError);
        }
      }

      await fetchClaims();
      closeModal();
      alert(`Claim ${actionType === 'approve' ? 'approved' : 'rejected'} successfully!`);
    } catch (error: any) {
      console.error('Error processing claim:', error);
      alert(`Failed to ${actionType} claim: ${error.message}`);
    } finally {
      setProcessing(false);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-purple-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-purple-100 text-purple-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.pending;
  };

  const statusCounts = {
    pending: claims.filter((c) => c.status === 'pending').length,
    approved: claims.filter((c) => c.status === 'approved').length,
    rejected: claims.filter((c) => c.status === 'rejected').length,
  };

  const totalClaimAmount = filteredClaims.reduce((sum, c) => sum + c.claim_amount, 0);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Claims Management</h1>
        <p className="text-gray-600">Review and process insurance claims</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Pending</p>
              <p className="text-3xl font-bold text-purple-600">{statusCounts.pending}</p>
            </div>
            <Clock className="w-10 h-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Approved</p>
              <p className="text-3xl font-bold text-green-600">{statusCounts.approved}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{statusCounts.rejected}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalClaimAmount)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-gray-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by claim number, client, agent, or policy..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claim #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Policy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filed Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No claims found
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{claim.claim_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{claim.client_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{claim.agent_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{claim.policy_number}</div>
                      <div className="text-xs text-gray-500">{claim.policy_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(claim.claim_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(claim.filed_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(claim.status)}
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                            claim.status
                          )}`}
                        >
                          {claim.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {claim.status === 'pending' ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openModal(claim, 'approve')}
                            className="p-2 bg-green-50 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal(claim, 'reject')}
                            className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredClaims.length} of {claims.length} claims
          </p>
        </div>
      </div>

      {showModal && selectedClaim && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {actionType === 'approve' ? 'Approve Claim' : 'Reject Claim'}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Claim Number</p>
                    <p className="font-semibold text-gray-900">{selectedClaim.claim_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Claim Amount</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(selectedClaim.claim_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-semibold text-gray-900">{selectedClaim.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Agent</p>
                    <p className="font-semibold text-gray-900">{selectedClaim.agent_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Policy</p>
                    <p className="font-semibold text-gray-900">{selectedClaim.policy_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Incident Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedClaim.incident_date)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-900">{selectedClaim.description}</p>
                </div>
              </div>

              {actionType === 'approve' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900">Commission will be generated</h3>
                      <p className="text-sm text-green-700 mt-1">
                        A 10% commission ({formatCurrency(selectedClaim.claim_amount * 0.10)}) will be automatically
                        created for {selectedClaim.agent_name}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {actionType === 'approve' ? 'Resolution Notes (Optional)' : 'Reason for Rejection *'}
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder={
                    actionType === 'approve'
                      ? 'Add any notes about this approval...'
                      : 'Explain why this claim is being rejected...'
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-4">
              <button
                onClick={closeModal}
                disabled={processing}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessClaim}
                disabled={processing}
                className={`px-6 py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 flex items-center space-x-2 ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {actionType === 'approve' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    <span>{actionType === 'approve' ? 'Approve Claim' : 'Reject Claim'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
