/**
 * Dashboard Page
 * ===============
 * Role-aware dashboard showing relevant statistics and quick actions.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks';
import {
  claimsApi,
  notificationsApi,
  paymentsApi,
  policiesApi,
  providersApi,
} from '../../api/services';
import { LoadingSpinner } from '../../components';
import type { Provider } from '../../api/types';

interface DashboardStats {
  totalPolicies?: number;
  totalClaims?: number;
  pendingClaims?: number;
  totalPayments?: number;
  unreadNotifications: number;
}

type DashboardTab = 'overview' | 'providers';

const dashboardTabs: { key: DashboardTab; label: string; description: string }[] = [
  { key: 'overview', label: 'Overview', description: 'Summary stats and quick actions' },
  {
    key: 'providers',
    label: 'Providers',
    description: 'Registered healthcare providers in the network',
  },
];

const providerIcons: Record<string, string> = {
  Hospital: '🏥',
  Clinic: '🩺',
  Pharmacy: '💊',
  Lab: '🔬',
  Specialist: '👨‍⚕️',
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ unreadNotifications: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [claimsRes, notifRes] = await Promise.all([
          claimsApi.list(),
          notificationsApi.unreadCount(),
        ]);

        const newStats: DashboardStats = {
          totalClaims: claimsRes.data.count,
          unreadNotifications: notifRes.data.data.unread_count,
        };

        if (user?.role === 'Citizen' || user?.role === 'Admin') {
          try {
            const policiesRes = await policiesApi.list();
            newStats.totalPolicies = policiesRes.data.count;
          } catch {
            /* ignore */
          }

          try {
            const paymentsRes = await paymentsApi.list();
            newStats.totalPayments = paymentsRes.data.count;
          } catch {
            /* ignore */
          }
        }

        if (user?.role === 'ClaimsOfficer' || user?.role === 'Admin') {
          try {
            const pendingRes = await claimsApi.pending();
            newStats.pendingClaims = pendingRes.data.count;
          } catch {
            /* ignore */
          }
        }

        if (user?.role === 'Supervisor' || user?.role === 'Admin') {
          try {
            const rejectedRes = await claimsApi.rejected();
            newStats.pendingClaims = (newStats.pendingClaims || 0) + rejectedRes.data.count;
          } catch {
            /* ignore */
          }
        }

        setStats(newStats);
      } catch {
        // ignore errors
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  useEffect(() => {
    if (activeTab !== 'providers') return;

    let isMounted = true;

    const loadProviders = async () => {
      setProvidersLoading(true);
      setProvidersError(false);

      try {
        const response = await providersApi.list();
        if (isMounted) {
          setProviders(response.data.results);
        }
      } catch {
        if (isMounted) {
          setProvidersError(true);
        }
      } finally {
        if (isMounted) {
          setProvidersLoading(false);
        }
      }
    };

    loadProviders();

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const activeTabDescription =
    dashboardTabs.find((tab) => tab.key === activeTab)?.description ?? '';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.first_name} {user?.last_name}
        </h1>
        <p className="text-gray-500 mt-1">Role: {user?.role}</p>
      </div>

      <div className="border-b border-gray-200 pb-3 mb-6">
        <div className="flex gap-3">
          {dashboardTabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 -mb-px text-sm font-semibold border-b-2 rounded-t-lg transition-colors focus:outline-none ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {activeTabDescription && (
          <p className="text-sm text-gray-500 mt-1">{activeTabDescription}</p>
        )}
      </div>

      {activeTab === 'overview' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.totalPolicies !== undefined && (
              <StatCard
                title="Policies"
                value={stats.totalPolicies}
                color="blue"
                link="/policies"
              />
            )}
            <StatCard
              title="Claims"
              value={stats.totalClaims || 0}
              color="green"
              link={user?.role === 'Citizen' ? '/claims' : '/officer/claims'}
            />
            {stats.pendingClaims !== undefined && (
              <StatCard
                title="Pending Review"
                value={stats.pendingClaims}
                color="yellow"
                link={
                  user?.role === 'Supervisor' ? '/supervisor/claims' : '/officer/claims'
                }
              />
            )}
            {stats.totalPayments !== undefined && (
              <StatCard
                title="Payments"
                value={stats.totalPayments}
                color="purple"
                link="/payments"
              />
            )}
            <StatCard
              title="Unread Notifications"
              value={stats.unreadNotifications}
              color="red"
              link="/notifications"
            />
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              {user?.role === 'Citizen' && (
                <>
                  <Link to="/claims/new" className="btn-primary">
                    Submit New Claim
                  </Link>
                  <Link to="/policies" className="btn-secondary">
                    View Policies
                  </Link>
                  <Link to="/claims" className="btn-secondary">
                    View Claims
                  </Link>
                </>
              )}
              {(user?.role === 'ClaimsOfficer' || user?.role === 'Admin') && (
                <Link to="/officer/claims" className="btn-primary">
                  Review Claims
                </Link>
              )}
              {(user?.role === 'Supervisor' || user?.role === 'Admin') && (
                <Link to="/supervisor/claims" className="btn-primary">
                  Override Claims
                </Link>
              )}
              {user?.role === 'Admin' && (
                <Link to="/admin/users" className="btn-secondary">
                  Manage Users
                </Link>
              )}
              <Link to="/notifications" className="btn-secondary">
                Notifications
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {providersLoading ? (
            <LoadingSpinner message="Loading providers..." />
          ) : providersError ? (
            <div className="card text-center py-12">
              <p className="text-gray-500">Failed to load providers.</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500">No providers registered.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {providerIcons[provider.provider_type] || '🏢'}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{provider.name}</h3>
                      <p className="text-sm text-gray-500">{provider.provider_type}</p>
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        License: {provider.license_number}
                      </p>
                      {provider.address && (
                        <p className="text-xs text-gray-500 mt-1">{provider.address}</p>
                      )}
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        provider.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {provider.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  link: string;
}

const colorMap = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
};

const StatCard: React.FC<StatCardProps> = ({ title, value, color, link }) => (
  <Link
    to={link}
    className={`block p-6 rounded-lg border-2 ${colorMap[color]} hover:shadow-md transition-shadow`}
  >
    <p className="text-sm font-medium opacity-75">{title}</p>
    <p className="text-3xl font-bold mt-1">{value}</p>
  </Link>
);

export default DashboardPage;
