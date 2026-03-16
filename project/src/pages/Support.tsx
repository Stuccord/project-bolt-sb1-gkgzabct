import React from 'react';
import { BookOpen, Mail, Phone, MessageCircle, FileQuestion, Video } from 'lucide-react';

export default function Support() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentation & Support</h1>
        <p className="text-gray-600">Get help and learn how to use the platform effectively</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">User Guide</h3>
          <p className="text-sm text-gray-600">
            Comprehensive documentation on how to use all features of the agent portal
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <Video className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Video Tutorials</h3>
          <p className="text-sm text-gray-600">
            Step-by-step video guides for common tasks and workflows
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <FileQuestion className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">FAQ</h3>
          <p className="text-sm text-gray-600">
            Frequently asked questions and quick answers to common issues
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Email Support</h4>
              <p className="text-sm text-gray-600 mb-2">Get help via email within 24 hours</p>
              <a href="mailto:support@bearguard.com" className="text-sm text-purple-600 hover:underline">
                support@bearguard.com
              </a>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Phone Support</h4>
              <p className="text-sm text-gray-600 mb-2">Call us Monday to Friday, 9AM - 5PM</p>
              <a href="tel:+233202525255" className="text-sm text-purple-600 hover:underline">
                +233 20 252 5255
              </a>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Live Chat</h4>
              <p className="text-sm text-gray-600 mb-2">Chat with our support team instantly</p>
              <button className="text-sm text-purple-600 hover:underline">Start Chat</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Start Guide</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Add Your First Client</h4>
              <p className="text-sm text-gray-600">
                Navigate to New Client Referral and fill in the client details along with their policy
                information
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Manage Policies</h4>
              <p className="text-sm text-gray-600">
                Track all your client policies in Policy Management. Update status, view details, or renew
                policies
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Track Your Earnings</h4>
              <p className="text-sm text-gray-600">
                Monitor your commissions in the Commissions page. View monthly breakdowns and total earnings
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
              4
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Generate Reports</h4>
              <p className="text-sm text-gray-600">
                Access comprehensive analytics in Reports & Analytics and export your performance data
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
