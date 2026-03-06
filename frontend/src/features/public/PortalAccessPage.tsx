import React from 'react';
import { Link } from 'react-router-dom';

const portalSteps = [
  {
    title: 'Register with your Emirates ID',
    description:
      'Create an NHISP account with your identity details and a verified email address to unlock the portal.',
  },
  {
    title: 'Verify and secure your access',
    description:
      'Set up multi-factor authentication and ensure your email or mobile number is confirmed before signing in.',
  },
  {
    title: 'Manage services with confidence',
    description:
      'Navigate claims, benefits, provider directories, and payments through a unified dashboard that keeps history at your fingertips.',
  },
];

const supportHighlights = [
  {
    title: 'Live chat & phone',
    detail: 'Agents are available Saturday to Thursday, 8:00 AM – 8:00 PM.',
  },
  {
    title: 'Email updates',
    detail: 'Receive confirmations, claim notices, and alerts from our secure email channel.',
  },
];

const PortalAccessPage: React.FC = () => (
  <div className="mx-auto max-w-4xl px-6 py-16 space-y-10">
    <section className="rounded-3xl border border-gray-200 bg-white p-10 shadow-lg">
      <p className="text-sm font-semibold uppercase tracking-[0.4em] text-gov-accent">Portal Access</p>
      <h1 className="mt-3 text-3xl font-bold text-gray-900">Secure login for every citizen</h1>
      <p className="mt-3 text-gray-600">
        A single, secure entry point links you to all NHISP services. Follow these quick steps and you will be ready to manage your
        benefits in minutes.
      </p>
    </section>

    <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
      <ol className="space-y-6">
        {portalSteps.map((step, index) => (
          <li key={step.title} className="space-y-2">
            <div className="flex items-center gap-3 text-sm font-semibold text-gray-500">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gov-accent/20 text-gov-accent">
                {index + 1}
              </span>
              Step {index + 1}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{step.title}</h2>
            <p className="text-sm text-gray-600">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>

    <section className="space-y-6 rounded-3xl border border-gray-200 bg-gradient-to-r from-gov-dark to-gov-medium p-10 text-white shadow-xl">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-gov-accent/80">Need help signing in?</p>
        <h2 className="text-2xl font-semibold">Support is just a click away</h2>
        <p className="text-sm text-white/90">
          Reach out via phone, live chat, or email to unlock access or troubleshoot any step of the login journey.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {supportHighlights.map((highlight) => (
          <div key={highlight.title} className="rounded-2xl border border-white/20 bg-white/10 p-4">
            <p className="text-sm font-semibold text-white">{highlight.title}</p>
            <p className="mt-1 text-sm text-white/80">{highlight.detail}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to="/login" className="btn-primary">
          Continue to login
        </Link>
        <Link to="/contact" className="btn-secondary bg-white/10 text-white">
          Contact support
        </Link>
      </div>
    </section>
  </div>
);

export default PortalAccessPage;
