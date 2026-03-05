import React from 'react';
import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Contact', to: '/contact' },
  { label: 'Portal Access', to: '/portal' },
];

const contactDetails = [
  {
    label: 'Address',
    value: '123 Global Health Avenue, Capital City, NH 10001',
  },
  {
    label: 'Email',
    value: 'info@nhisp.gov',
    href: 'mailto:info@nhisp.gov',
  },
  {
    label: 'Phone',
    value: '+1 (800) 555-0199',
    href: 'tel:+18005550199',
  },
];

const supportLinks = [
  { label: 'Report an issue', href: 'mailto:support@nhisp.gov' },
  { label: 'Call portal support', href: 'tel:+18005550199' },
  { label: 'Request outreach', href: 'mailto:outreach@nhisp.gov' },
];

const currentYear = new Date().getFullYear();

const PublicFooter: React.FC = () => (
  <footer className="bg-gov-dark text-white">
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-4">
          <p className="text-xl font-semibold">NHISP</p>
          <p className="text-sm text-gray-200">
            Delivering trusted national health insurance information and services for every citizen.
          </p>
          <div className="space-y-2 text-sm text-gray-200">
            {contactDetails.map((detail) => (
              <div key={detail.label}>
                <p className="text-xs uppercase tracking-widest text-gray-400">{detail.label}</p>
                {detail.href ? (
                  <a className="text-white hover:text-gov-accent" href={detail.href}>
                    {detail.value}
                  </a>
                ) : (
                  <p>{detail.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm uppercase tracking-widest text-gray-400">Quick links</p>
          <div className="mt-3 space-y-2 text-sm text-gray-200">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block hover:text-gov-accent"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm uppercase tracking-widest text-gray-400">Need support?</p>
          <div className="space-y-2 text-sm text-gray-200">
            {supportLinks.map((link) => (
              <a key={link.label} href={link.href} className="block hover:text-gov-accent">
                {link.label}
              </a>
            ))}
          </div>
          <Link to="/portal" className="btn-secondary w-full text-center text-sm">
            Visit the Portal
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10 pt-6 flex flex-col gap-3 text-xs text-gray-200 md:flex-row md:items-center md:justify-between">
        <p>© {currentYear} NHISP. All rights reserved.</p>
        <div className="flex flex-wrap gap-4">
          <Link to="/contact" className="hover:text-white">
            Contact
          </Link>
          <Link to="/services" className="hover:text-white">
            Services
          </Link>
          <Link to="/portal" className="hover:text-white">
            Portal Access
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

export default PublicFooter;