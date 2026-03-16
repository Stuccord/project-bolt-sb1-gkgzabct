import React, { useState } from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function NewReferral() {
  const { agent } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    hospital: '',
    injury_type: '',
    accident_date: '',
    accident_description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('referrals')
        .insert([
          {
            rep_id: agent!.id,
            case_number: '',
            ...formData,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      alert(`Referral submitted successfully! Case Number: ${data.case_number}`);
      setFormData({
        client_name: '',
        client_phone: '',
        client_email: '',
        hospital: '',
        injury_type: '',
        accident_date: '',
        accident_description: '',
      });
    } catch (error: any) {
      console.error('Error submitting referral:', error);
      alert('Error submitting referral: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submit New Referral</h1>
          <p className="text-gray-600">Enter victim details to create a new case</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                id="client_name"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="e.g., Kwame Mensah"
              />
            </div>

            <div>
              <label htmlFor="client_phone" className="block text-sm font-medium text-gray-700 mb-2">
                Client Phone *
              </label>
              <input
                type="tel"
                id="client_phone"
                name="client_phone"
                value={formData.client_phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="0244-123-456"
              />
            </div>

            <div>
              <label htmlFor="client_email" className="block text-sm font-medium text-gray-700 mb-2">
                Client Email
              </label>
              <input
                type="email"
                id="client_email"
                name="client_email"
                value={formData.client_email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="client@email.com"
              />
            </div>

            <div>
              <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-2">
                Hospital *
              </label>
              <select
                id="hospital"
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="">Select Hospital</option>
                <option value="Akuse Government Hospital">Akuse Government Hospital</option>
                <option value="Eastern Regional Hospital">Eastern Regional Hospital</option>
                <option value="Kade Government Hospital">Kade Government Hospital</option>
                <option value="Kwahu Government Hospital">Kwahu Government Hospital</option>
                <option value="New Abirem Government Hospital">New Abirem Government Hospital</option>
                <option value="Nsawam Government Hospital">Nsawam Government Hospital</option>
                <option value="St Joseph's Orthopaedic Hospital">St Joseph's Orthopaedic Hospital</option>
                <option value="Suhum Government Hospital">Suhum Government Hospital</option>
                <option value="Tetteh Quarshie Memorial Hospital">Tetteh Quarshie Memorial Hospital</option>
                <option value="Volta River Authority Hospital">Volta River Authority Hospital</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="injury_type" className="block text-sm font-medium text-gray-700 mb-2">
                Injury Type *
              </label>
              <select
                id="injury_type"
                name="injury_type"
                value={formData.injury_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="">Select Status</option>
                <option value="Injured">Injured</option>
                <option value="Deceased">Deceased</option>
              </select>
            </div>

            <div>
              <label htmlFor="accident_date" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Accident *
              </label>
              <input
                type="date"
                id="accident_date"
                name="accident_date"
                value={formData.accident_date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="accident_description" className="block text-sm font-medium text-gray-700 mb-2">
              Accident Description *
            </label>
            <textarea
              id="accident_description"
              name="accident_description"
              value={formData.accident_description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Provide detailed description of how the accident occurred..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  client_name: '',
                  client_phone: '',
                  client_email: '',
                  hospital: '',
                  injury_type: '',
                  accident_date: '',
                  accident_description: '',
                });
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Submit Referral</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
