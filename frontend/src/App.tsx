/**
 * App.tsx - Main Application Router
 * ===================================
 * Defines all application routes with role-based protection.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/AuthContext';
import { ProtectedRoute } from './components';
import Layout from './components/Layout';

// -- Lazy loaded pages -------------------------------------------------------
const LoginPage = React.lazy(() => import('./features/auth/LoginPage'));
const DashboardPage = React.lazy(() => import('./features/dashboard/DashboardPage'));
const PoliciesPage = React.lazy(() => import('./features/policies/PoliciesPage'));
const ClaimsPage = React.lazy(() => import('./features/claims/ClaimsPage'));
const SubmitClaimPage = React.lazy(() => import('./features/claims/SubmitClaimPage'));
const OfficerClaimsPage = React.lazy(() => import('./features/claims/OfficerClaimsPage'));
const SupervisorOverridePage = React.lazy(() => import('./features/claims/SupervisorOverridePage'));
const PaymentsPage = React.lazy(() => import('./features/payments/PaymentsPage'));
const NotificationsPage = React.lazy(() => import('./features/notifications/NotificationsPage'));
const AdminUsersPage = React.lazy(() => import('./features/admin/AdminUsersPage'));
const ProvidersPage = React.lazy(() => import('./features/providers/ProvidersPage'));
const PublicLayout = React.lazy(() => import('./public/PublicLayout'));
const HomePage = React.lazy(() => import('./public/HomePage'));
const ServicesPage = React.lazy(() => import('./public/ServicesPage'));
const ContactPage = React.lazy(() => import('./public/ContactPage'));
const PortalAccessPage = React.lazy(() => import('./public/PortalAccessPage'));

// -- Loading fallback --------------------------------------------------------
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#fff', color: '#1f2937', fontSize: '14px' },
            success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />

        <React.Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="portal" element={<PortalAccessPage />} />
            </Route>
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes - wrapped in Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard - all authenticated users */}
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Policies - all authenticated users */}
              <Route path="/policies" element={<PoliciesPage />} />

              {/* Claims - Citizens */}
              <Route
                path="/claims"
                element={
                  <ProtectedRoute allowedRoles={['Citizen']}>
                    <ClaimsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/claims/submit"
                element={
                  <ProtectedRoute allowedRoles={['Citizen']}>
                    <SubmitClaimPage />
                  </ProtectedRoute>
                }
              />

              {/* Claims Review - Officers & Supervisors & Admin */}
              <Route
                path="/claims/review"
                element={
                  <ProtectedRoute allowedRoles={['ClaimsOfficer', 'Supervisor', 'Admin']}>
                    <OfficerClaimsPage />
                  </ProtectedRoute>
                }
              />

              {/* Supervisor Override */}
              <Route
                path="/claims/override"
                element={
                  <ProtectedRoute allowedRoles={['Supervisor', 'Admin']}>
                    <SupervisorOverridePage />
                  </ProtectedRoute>
                }
              />

              {/* Payments - Staff */}
              <Route
                path="/payments"
                element={
                  <ProtectedRoute allowedRoles={['ClaimsOfficer', 'Supervisor', 'Admin']}>
                    <PaymentsPage />
                  </ProtectedRoute>
                }
              />

              {/* Providers - all authenticated */}
              <Route path="/providers" element={<ProvidersPage />} />

              {/* Notifications - all authenticated */}
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* Admin - User Management */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
