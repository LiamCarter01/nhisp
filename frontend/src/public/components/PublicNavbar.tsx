import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Contact', to: '/contact' },
  { label: 'Portal Access', to: '/portal' },
];

const PublicNavbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gov-dark flex items-center justify-center text-white font-semibold tracking-wide">
              NH
            </div>
            <div>
              <p className="text-lg font-bold text-gov-dark leading-none">NHISP</p>
              <p className="text-xs uppercase tracking-widest text-gray-500">National Health Insurance Services Portal</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-medium text-gray-600 hover:text-gov-dark transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center">
            <Link to="/login" className="btn-primary text-sm">
              Portal Login
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gov-dark focus:outline-none focus:ring-2 focus:ring-gov-accent focus:ring-offset-2"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
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
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block text-base font-medium text-gray-700 hover:text-gov-dark"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/login"
              className="btn-primary block text-center text-sm"
              onClick={() => setMenuOpen(false)}
            >
              Portal Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;