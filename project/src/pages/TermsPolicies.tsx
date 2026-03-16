import React from 'react';
import { Shield, DollarSign, Lock, AlertCircle, FileText, Users } from 'lucide-react';

export default function TermsPolicies() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Policies</h1>
        <p className="text-gray-600">Payment schedule, data protection, and ethical guidelines</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Commission Structure</h2>
              <p className="text-gray-600">How and when you get paid</p>
            </div>
          </div>

          <div className="space-y-4 text-gray-700">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Commission Rate</h3>
              <p>Referral representatives earn <strong className="text-blue-900">GHS 200 commission</strong> per successfully completed case.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Payment Schedule</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Commissions are calculated automatically when a claim is marked as "Paid"</li>
                <li>Payments are processed within <strong>7-14 business days</strong> after claim settlement</li>
                <li>All commissions are paid via mobile money or bank transfer</li>
                <li>Monthly commission statements are available in your dashboard</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Payment Requirements</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Valid mobile money number or bank account details must be on file</li>
                <li>Minimum payout threshold: GHS 50.00</li>
                <li>Payment delays may occur if case documentation is incomplete</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="p-3 bg-green-100 rounded-xl">
              <Lock className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Protection & Privacy</h2>
              <p className="text-gray-600">How we protect client information</p>
            </div>
          </div>

          <div className="space-y-4 text-gray-700">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Confidentiality</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>All client information is strictly confidential and protected</li>
                <li>Data is encrypted and stored securely in compliance with data protection laws</li>
                <li>Never share client details with unauthorized third parties</li>
                <li>Access to case information is restricted to authorized personnel only</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Your Responsibilities</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Keep your login credentials secure and never share them</li>
                <li>Report any suspected security breaches immediately</li>
                <li>Do not access or view client records outside your referrals</li>
                <li>Log out of the system when using shared devices</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Shield className="w-6 h-6 text-yellow-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ethical Guidelines</h2>
              <p className="text-gray-600">Professional conduct standards</p>
            </div>
          </div>

          <div className="space-y-4 text-gray-700">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Professional Conduct</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Always act in the best interest of the client</li>
                <li>Provide accurate and truthful information at all times</li>
                <li>Do not make false promises about claim amounts or processing times</li>
                <li>Treat all clients with respect and dignity</li>
                <li>Maintain professional boundaries with clients</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Prohibited Activities</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>No solicitation at hospitals</strong> without proper authorization</li>
                <li><strong>No fabrication or exaggeration</strong> of injury details</li>
                <li><strong>No harassment</strong> of clients for referrals</li>
                <li><strong>No sharing of commissions</strong> with unauthorized parties</li>
                <li><strong>No conflict of interest</strong> relationships with medical providers</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Violations & Consequences</h3>
                  <p className="text-sm text-red-800">
                    Violation of these ethical guidelines may result in suspension of referral privileges,
                    withholding of commissions, or termination from the BearGuard referral program.
                    Serious violations may be reported to relevant authorities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FileText className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Case Processing Guidelines</h2>
              <p className="text-gray-600">What to expect during case processing</p>
            </div>
          </div>

          <div className="space-y-4 text-gray-700">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Case Stages</h3>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li><strong>Awaiting Police Report:</strong> Police documentation is being obtained (5-10 days)</li>
                <li><strong>In Review:</strong> Legal team reviewing case merits (3-7 days)</li>
                <li><strong>Submitted:</strong> Claim submitted to insurance company (14-30 days)</li>
                <li><strong>Awaiting Payment:</strong> Claim approved, payment processing (7-14 days)</li>
                <li><strong>Paid:</strong> Claim settled, commission released</li>
              </ol>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Required Documentation</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Official police report (original or certified copy)</li>
                <li>Medical reports and treatment records</li>
                <li>Hospital bills and receipts</li>
                <li>Client identification documents</li>
                <li>Witness statements (if applicable)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Users className="w-6 h-6 text-indigo-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Support & Assistance</h2>
              <p className="text-gray-600">How to get help</p>
            </div>
          </div>

          <div className="space-y-4 text-gray-700">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Getting Support</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Use the <strong>Support & Complaints</strong> section to raise concerns</li>
                <li>Response time: 24-48 hours for general inquiries</li>
                <li>Urgent payment issues are prioritized</li>
                <li>Training resources available in Documents section</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Agreement</h3>
              <p className="text-sm text-blue-800">
                By continuing to use the BearGuard referral system, you acknowledge that you have read,
                understood, and agree to comply with these terms and policies. These terms may be updated
                periodically, and you will be notified of any significant changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
