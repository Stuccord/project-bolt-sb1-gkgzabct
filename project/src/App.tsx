import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewClient from './pages/NewClient';
import Policies from './pages/Policies';
import Claims from './pages/Claims';
import Commissions from './pages/Commissions';
import Reports from './pages/Reports';
import Support from './pages/Support';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AgentManagement from './pages/admin/AgentManagement';
import ReferralManagement from './pages/admin/ReferralManagement';
import WithdrawalProcessing from './pages/admin/WithdrawalProcessing';
import ClaimsManagement from './pages/admin/ClaimsManagement';
import FileClaim from './pages/FileClaim';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import TeamOverview from './pages/manager/TeamOverview';
import ReferralDashboard from './pages/ReferralDashboard';
import NewReferral from './pages/NewReferral';
import PendingReferrals from './pages/PendingReferrals';
import CompletedReferrals from './pages/CompletedReferrals';
import Documents from './pages/Documents';
import SupportTickets from './pages/SupportTickets';
import TermsPolicies from './pages/TermsPolicies';
import Leaderboard from './pages/Leaderboard';
import Withdrawals from './pages/Withdrawals';
import Notifications from './pages/Notifications';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';

import { isConfigured } from './lib/supabase';
import { Shield, ExternalLink } from 'lucide-react';

function AppContent() {
  const { user, agent, loading, signOut, setupError } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-lg w-full bg-white p-12 rounded-3xl shadow-xl border border-gray-100">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center">
              <Shield className="w-10 h-10 text-amber-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight text-center">Connection Required</h1>
          <p className="text-gray-600 mb-8 leading-relaxed text-center">
            Your application is launched but not yet connected to its database safely. You need to add your Supabase credentials to your hosting platform's environment variables.
          </p>
          
          <div className="space-y-3 mb-8 text-left bg-gray-50 p-6 rounded-2xl border border-gray-100 font-mono text-sm leading-6">
            <p className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${import.meta.env.VITE_SUPABASE_URL ? 'bg-green-500' : 'bg-red-500'}`}/> 
              VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Connected' : '❌ Missing'}
            </p>
            <p className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'bg-green-500' : 'bg-red-500'}`}/> 
              VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Connected' : '❌ Missing'}
            </p>
          </div>

          <a 
            href="https://github.com/Stuccord/bearguard-project/settings/secrets/actions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center px-8 py-4 bg-amber-500 text-white rounded-2xl font-semibold hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 active:scale-95"
          >
            Add Secrets to GitHub
            <ExternalLink className="ml-2 w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (agent) {
      if (agent.role === 'admin') {
        setCurrentPage('admin-dashboard');
      } else if (agent.role === 'manager') {
        setCurrentPage('manager-dashboard');
      } else {
        setCurrentPage('referral-dashboard');
      }
    } else if (!user) {
      setCurrentPage('landing');
    }
  }, [agent, user]);

  // Removed automatic reload loop as profile creation is now handled in AuthContext
  /*
  useEffect(() => {
    if (user && !agent && !loading) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, agent, loading]);
  */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <img src="/Ps-Leo_9-removebg-preview.png" alt="BearGuard" className="w-32 h-32 mx-auto mb-4 animate-pulse" />
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (currentPage === 'landing') {
      return <LandingPage onNavigate={setCurrentPage} />;
    }
    if (currentPage === 'signup') {
      return <Signup onNavigate={setCurrentPage} />;
    }
    if (currentPage === 'login') {
      return <Login onNavigate={setCurrentPage} />;
    }
    return <LandingPage onNavigate={setCurrentPage} />;
  }

  if (!agent && user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-sm w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <img src="/Ps-Leo_9-removebg-preview.png" alt="BearGuard" className="w-24 h-24 mx-auto mb-6 animate-pulse" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Setting up your profile</h2>
          <p className="text-gray-600 mb-6">This will only take a moment.</p>
          
          {setupError && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl text-left">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Diagnostic Info:</p>
              <p className="text-sm text-red-700 leading-relaxed font-medium">{setupError}</p>
            </div>
          )}

          {!setupError && (
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              If it takes longer than 10 seconds, there might be a connection issue.
            </p>
          )}
          
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-semibold shadow-lg shadow-purple-200 active:scale-95"
            >
              Retry Setup
            </button>
            <button 
              onClick={() => signOut()}
              className="w-full py-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all font-semibold active:scale-95"
            >
              Log Out
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-50">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              Logged in as
            </p>
            <p className="text-xs font-semibold text-gray-600">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    if (currentPage === 'landing') {
      return <LandingPage onNavigate={setCurrentPage} />;
    }

    switch (currentPage) {
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={setCurrentPage} />;
      case 'agent-management':
        return <AgentManagement />;
      case 'referral-management':
        return <ReferralManagement />;
      case 'claims-management':
        return <ClaimsManagement />;
      case 'withdrawal-processing':
        return <WithdrawalProcessing />;
      case 'manager-dashboard':
        return <ManagerDashboard />;
      case 'team-overview':
        return <TeamOverview />;
      case 'dashboard':
        return <Dashboard />;
      case 'referral-dashboard':
        return <ReferralDashboard />;
      case 'new-client':
        return <NewClient />;
      case 'new-referral':
        return <NewReferral />;
      case 'pending-referrals':
        return <PendingReferrals />;
      case 'completed-referrals':
        return <CompletedReferrals />;
      case 'documents':
        return <Documents />;
      case 'support-tickets':
        return <SupportTickets />;
      case 'terms-policies':
        return <TermsPolicies />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'policies':
        return <Policies />;
      case 'claims':
        return <Claims onNavigate={setCurrentPage} />;
      case 'file-claim':
        return <FileClaim onNavigate={setCurrentPage} />;
      case 'commissions':
        return <Commissions />;
      case 'withdrawals':
        return <Withdrawals />;
      case 'reports':
        return <Reports />;
      case 'support':
        return <Support />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'notifications':
        return <Notifications />;
      default:
        if (agent?.role === 'admin') return <AdminDashboard />;
        if (agent?.role === 'manager') return <ManagerDashboard />;
        return <ReferralDashboard />;
    }
  };

  if (currentPage === 'landing') {
    return renderPage();
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className={`hidden lg:block ${sidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300`}>
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-50" onClick={() => setMobileSidebarOpen(false)}>
          <div className="w-64 h-full" onClick={(e) => e.stopPropagation()}>
            <Sidebar
              currentPage={currentPage}
              onNavigate={(page) => {
                setCurrentPage(page);
                setMobileSidebarOpen(false);
              }}
              collapsed={false}
              onToggleCollapse={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav onMenuClick={() => setMobileSidebarOpen(true)} onNavigate={setCurrentPage} onCloseSidebar={() => setMobileSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
