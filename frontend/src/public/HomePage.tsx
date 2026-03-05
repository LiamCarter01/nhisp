import React from 'react';
import { Link } from 'react-router-dom';

const serviceHighlights = [
  {
    title: 'Insurance Policies',
    description: 'Explore eligibility, coverage tiers, and renewal dates without leaving the portal.',
    detail: 'Compare plans, review contributions, and receive alerts when your coverage is about to renew.',
  },
  {
    title: 'Claims Oversight',
    description: 'Track submitted claims, speed up approvals, and see real-time payment information.',
    detail: 'Upload documentation, monitor status updates, and receive secure notifications for every milestone.',
  },
  {
    title: 'Provider Network',
    description: 'Search accredited hospitals, clinics, and pharmacies near you.',
    detail: 'Filter by specialty, location, and patient reviews to make informed decisions during care journeys.',
  },
  {
    title: 'Payments & Support',
    description: 'Check disbursements, schedule premium payments, and raise inquiries.',
    detail: 'View your payment calendar, access downloadable receipts, and speak with support via chat or call.',
  },
];

const stats = [
  { label: 'Claims processed annually', value: '1.4M+' },
  { label: 'Certified provider partners', value: '450+' },
  { label: 'Citizen satisfaction', value: '98%' },
];

const steps = [
  {
    title: 'Verify Identity',
    description: 'Confirm your national ID and contact details so we can keep your profile secure.',
  },
  {
    title: 'Explore Services',
    description: 'Browse policy, claims, and provider insights to stay informed before engaging.',
  },
  {
    title: 'Stay Engaged',
    description: 'Monitor claims, payments, and official announcements from one dashboard.',
  },
];

const HomePage: React.FC = () => (
  <div className="space-y-10">
    <section className="bg-gradient-to-br from-gov-medium to-gov-dark text-white">
      <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col gap-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-100">National Health Insurance Services Portal</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Modern, secure, and citizen-centric health insurance services.</h1>
          <p className="text-lg text-blue-200">
            The NHISP public site introduces the portal, highlights flagship services, and connects citizens directly to login tools whenever they are ready to engage.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/portal" className="btn-primary">
            Access Portal
          </Link>
          <Link to="/contact" className="btn-secondary">
            Contact Administration
          </Link>
        </div>

        <p className="text-sm text-blue-100">
          Already registered?{' '}
          <Link to="/login" className="font-semibold underline">
            Sign in to your account
          </Link>
          .
        </p>
      </div>
    </section>

    <section className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-4 space-y-10">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-gov-dark">Key services</p>
          <h2 className="text-3xl font-semibold text-gray-900">Everything citizens need, ready on day one.</h2>
          <p className="text-gray-600">
            From enrollment to claims tracking, the NHISP portal bundles essential touchpoints into a confident, production-like experience.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {serviceHighlights.map((highlight) => (
            <div key={highlight.title} className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
              <p className="text-sm font-semibold text-gov-dark">{highlight.title}</p>
              <h3 className="mt-3 text-xl font-semibold text-gray-900">{highlight.description}</h3>
              <p className="mt-4 text-sm text-gray-600">{highlight.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-gray-100 py-16">
      <div className="max-w-6xl mx-auto px-4 space-y-10">
        <div className="grid gap-8 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
              <p className="text-3xl font-semibold text-gov-dark">{stat.value}</p>
              <p className="mt-2 text-sm uppercase tracking-widest text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-900">How it works</h3>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <span className="text-sm font-bold text-gov-accent">Step {index + 1}</span>
                <h4 className="mt-3 text-xl font-semibold text-gray-900">{step.title}</h4>
                <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default HomePage;