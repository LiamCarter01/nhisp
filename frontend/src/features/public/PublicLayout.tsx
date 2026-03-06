import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Contact', path: '/contact' },
  { label: 'Portal Access', path: '/portal-access' },
];

const currentYear = new Date().getFullYear();

const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-gov-dark text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-2xl font-bold tracking-widest">
            NHISP
          </Link>
          <nav className="hidden items-center gap-5 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/portal-access" className="btn-primary">
              Portal Access
            </Link>
            <Link to="/login" className="text-sm font-semibold text-white/80 hover:text-white">
              Login
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden"
          >
            <span className="sr-only">Toggle navigation</span>
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-gov-dark/90 px-6 pb-4">
            <nav className="flex flex-col gap-2 py-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `rounded-full px-3 py-2 text-sm font-semibold transition ${
                      isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex flex-col gap-2">
              <Link
                to="/portal-access"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary text-center"
              >
                Portal Access
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-white/80 text-center hover:text-white"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} National Health Insurance Services Portal. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/contact" className="hover:text-gray-900">
              Contact
            </Link>
            <Link to="/services" className="hover:text-gray-900">
              Services
            </Link>
            <Link to="/portal-access" className="hover:text-gray-900">
              Portal Access
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
