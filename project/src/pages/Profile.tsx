import React, { useState } from 'react';
import { User, Mail, Phone, Shield, Calendar, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { agent } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    full_name: agent?.full_name || '',
    phone: agent?.phone || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;

    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('agents')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq('id', agent.id);

      if (error) throw error;

      setMessage('Profile updated successfully!');
      setEditing(false);

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'manager':
        return 'bg-teal-100 text-teal-700';
      default:
        return 'bg-indigo-100 text-indigo-700';
    }
  };

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your personal information and account details</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${message.includes('success') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32"></div>

        <div className="px-8 pb-8">
          <div className="flex items-end justify-between -mt-16 mb-6">
            <div className="flex items-end space-x-4">
              <div className="w-32 h-32 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
              <div className="pb-2">
                <h2 className="text-2xl font-bold text-gray-900">{agent.full_name}</h2>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 capitalize ${getRoleBadgeColor(agent.role)}`}>
                  {agent.role}
                </span>
              </div>
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+233 123 456 789"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      full_name: agent.full_name,
                      phone: agent.phone || '',
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-2 text-gray-500 mb-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Email Address</span>
                  </div>
                  <p className="text-gray-900 ml-6">{agent.email}</p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-gray-500 mb-2">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">Phone Number</span>
                  </div>
                  <p className="text-gray-900 ml-6">{agent.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-2 text-gray-500 mb-2">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">Role</span>
                  </div>
                  <p className="text-gray-900 ml-6 capitalize">{agent.role}</p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-gray-500 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">Member Since</span>
                  </div>
                  <p className="text-gray-900 ml-6">{formatDate(agent.created_at)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Account Information</h3>
        <p className="text-sm text-blue-700">
          Your email address cannot be changed. If you need to update your email, please contact your administrator.
        </p>
      </div>
    </div>
  );
}
