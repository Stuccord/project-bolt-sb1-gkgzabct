import React, { useState, useEffect } from 'react';
import { Bell, Menu, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface TopNavProps {
  onMenuClick: () => void;
  onNavigate: (page: string) => void;
  onCloseSidebar: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function TopNav({ onMenuClick, onNavigate, onCloseSidebar }: TopNavProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { agent, signOut } = useAuth();

  useEffect(() => {
    if (agent) {
      fetchNotifications();
    }
  }, [agent]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`agent_id.eq.${agent!.id},agent_id.is.null`)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const unreadCount = notifications.length;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex items-center space-x-3">
          <img src="/Ps-Leo_9-removebg-preview.png" alt="BearGuard" className="w-10 h-10" />
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {agent?.full_name?.split(' ')[0] || 'Agent'}
          </h2>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowDropdown(false);
              onCloseSidebar();
            }}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-6 h-6 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No new notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => {
                        onNavigate('notifications');
                        setShowNotifications(false);
                      }}
                      className="w-full p-4 hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'success' ? 'bg-green-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          notification.type === 'error' ? 'bg-red-500' :
                          'bg-indigo-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.created_at)}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-gray-200 text-center">
                <button
                  onClick={() => {
                    onNavigate('notifications');
                    setShowNotifications(false);
                  }}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
              setShowNotifications(false);
              onCloseSidebar();
            }}
            className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {agent?.avatar_url ? (
              <img
                src={agent.avatar_url}
                alt={agent.full_name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-600">
                <span className="text-gray-900 text-sm font-semibold">
                  {agent?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-900">{agent?.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{agent?.role}</p>
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              <button
                onClick={() => {
                  onNavigate('profile');
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('settings');
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <hr className="my-2 border-gray-200" />
              <button
                onClick={signOut}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
