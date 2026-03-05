import React from 'react';
import { Link } from 'react-router-dom';

const benefits = [
  '24/7 access to enrollment, claims, and payment tools',
  'Secure document uploads with real-time validation',
  'Dedicated channel to contact claims and support officers',
];

const securityMeasures = [
  'Multi-factor authentication for citizen accounts',
  'Role-based controls for officer and administrator actions',
  'Encrypted data transmission and audit-ready logs',
];

const steps = [
  {
    title: 'Prepare documents',
    description: 'Have your national ID, insurance number, and contact details ready.',
  },
  {
    title: 'Verify email or phone',
    description: 'Receive an instant OTP or link to prove your identity.',
  },
  {
    title: 'Sign in securely',
    description: 'Once verified, enter your credentials on the login screen to reach your dashboard.',
  },
];

const PortalAccessPage: React.FC = () => (
  <section className="bg-white py-16">
    <div className="max-w-5xl mx-auto px-4 space-y-10">
      <div className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.5em] text-gov-dark">Portal access</p>
        <h1 className="text-4xl font-semibold text-gray-900">Secure portal login, simplified for citizens.</h1>
        <p className="text-gray-600">
          Follow these guided steps to reach the production-ready login flow. Your credentials remain protected by government-grade security practices.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {benefits.map((benefit) => (
          <div key={benefit} className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
            {benefit}
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Security you can trust</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            {securityMeasures.map((measure) => (
              <li key={measure} className="flex items-start gap-2">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gov-accent" aria-hidden />
                <span>{measure}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Ready in three steps</h2>
          <ol className="mt-3 space-y-4 text-sm text-gray-600">
            {steps.map((step, index) => (
              <li key={step.title} className="space-y-2">
                <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Step {index + 1}</p>
                <p className="font-semibold text-gray-900">{step.title}</p>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="text-center space-y-3">
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/login" className="btn-primary">
            Go to Login
          </Link>
          <Link to="/contact" className="btn-secondary">
            Contact Support
          </Link>
        </div>
        <p className="text-sm text-gray-600">
          Need a reminder about portal requirements? Visit the{' '}
          <Link to="/services" className="font-semibold text-gov-accent">
            Services overview
          </Link>
          .
        </p>
      </div>
    </div>
  </section>
);

export default PortalAccessPage;