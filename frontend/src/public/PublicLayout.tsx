import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './components/PublicNavbar';
import PublicFooter from './components/PublicFooter';

const PublicLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
    <PublicNavbar />
    <main className="flex-1 w-full">
      <Outlet />
    </main>
    <PublicFooter />
  </div>
);

export default PublicLayout;