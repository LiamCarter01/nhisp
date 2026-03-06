import React from 'react';
import { Link } from 'react-router-dom';

const services = [
  {
    title: 'Insurance Policy Enrollment',
    description: 'Compare basic, enhanced, and family plans, check eligibility, and submit documentation without leaving the portal.',
    bullets: [
      'Review contributions and premium schedules',
      'Receive guided prompts for supporting documents',
      'Download policy certificates in PDF',
    ],
  },
  {
    title: 'Claims Management',
    description: 'Submit new claims, upload proof, and receive transparent status updates.',
    bullets: [
      'Track every milestone and expected payout date',
      'Upload attachments instantly with secure encryption',
      'Contact claims officers with a single click',
    ],
  },
  {
    title: 'Provider Network & Partners',
    description: 'Discover accredited hospitals, clinics, pharmacies, and practitioners.',
    bullets: [
      'Filter by specialty, proximity, and ratings',
      'Access facility credential timelines and capacity details',
      'Bookmark preferred providers to receive announcements',
    ],
  },
  {
    title: 'Payments & Citizen Support',
    description: 'View disbursements, contribute premiums, and open service tickets.',
    bullets: [
      'View payment calendar and previous receipts',
      'Schedule recurring contributions securely',
      'Connect with the helpdesk via phone, email, or chat',
    ],
  },
];

const ServicesPage: React.FC = () => (
  <section className="bg-white py-16">
    <div className="max-w-6xl mx-auto px-4 space-y-10">
      <div className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-gov-dark">Services overview</p>
        <h1 className="text-4xl font-semibold text-gray-900">What NHISP offers every citizen</h1>
        <p className="text-gray-600">
          Each service is anchored to transparent workflows, guided documentation, and portal-ready interactions so you can take action confidently.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {services.map((service) => (
          <article key={service.title} className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">{service.title}</h2>
            <p className="mt-3 text-sm text-gray-600">{service.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              {service.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gov-accent" aria-hidden />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="text-center space-y-3">
        <p className="text-sm text-gray-600">
          Need immediate access?{' '}
          <Link to="/login" className="font-semibold text-gov-accent">
            Log in here
          </Link>
          , or explore the Portal Access page to prepare your credentials.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/portal" className="btn-primary">
            Portal Access Page
          </Link>
          <Link to="/contact" className="btn-secondary">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default ServicesPage;