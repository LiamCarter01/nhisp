/**
 * Layout Component
 * =================
 * Main application layout with sidebar navigation.
 */

import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useHasRole } from '../hooks';
import { notificationsApi } from '../api/services';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isCitizen = useHasRole('Citizen');
  const isOfficer = useHasRole('ClaimsOfficer');
  const isSupervisor = useHasRole('Supervisor');
  const isAdmin = useHasRole('Admin');

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationsApi.unreadCount();
        setUnreadCount(res.data.data.unread_count);
      } catch {
        // ignore
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', show: true },
    { label: 'Policies', path: '/policies', show: isCitizen || isAdmin },
    { label: 'My Claims', path: '/claims', show: isCitizen },
    { label: 'Submit Claim', path: '/claims/submit', show: isCitizen },
    { label: 'Review Claims', path: '/claims/review', show: isOfficer || isAdmin },
    { label: 'Override Claims', path: '/claims/override', show: isSupervisor || isAdmin },
    { label: 'Payments', path: '/payments', show: isCitizen || isAdmin },
    { label: 'Providers', path: '/providers', show: true },
    { label: 'Manage Users', path: '/admin/users', show: isAdmin },
    { label: 'Notifications', path: '/notifications', show: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gov-dark transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-gov-medium">
            <h1 className="text-white text-lg font-bold tracking-wide">NHISP</h1>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-gov-medium">
            <p className="text-white text-sm font-medium truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-blue-200 text-xs mt-0.5">{user?.role}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems
              .filter((item) => item.show)
              .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-gov-accent text-white'
                      : 'text-blue-100 hover:bg-gov-medium hover:text-white'
                  }`}
                >
                  {item.label}
                  {item.label === 'Notifications' && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}
          </nav>

          {/* Logout */}
          <div className="px-2 py-4 border-t border-gov-medium">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-gov-medium hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-4 p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            National Health Insurance Services Portal
          </h2>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
