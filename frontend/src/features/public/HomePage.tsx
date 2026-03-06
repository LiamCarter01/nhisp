import React from 'react';
import { Link } from 'react-router-dom';
import { publicServices } from './data/services';

const heroHighlights = [
  'Single sign-on for citizens and partners',
  'Live support during official hours',
  'Secure uploads and transparent tracking',
  'Notifications tailored to your case',
];

const quickFacts = [
  { label: 'Citizens served', value: '2.5M+' },
  { label: 'Providers in-network', value: '12,000+' },
  { label: 'Claims processed annually', value: '1.8M+' },
  { label: 'Average response time', value: '48 hrs' },
];

const focusPoints = [
  {
    title: 'Citizen-first guidance',
    description: 'Dedicated service representatives help you understand benefits, eligibility, and next steps without jargon.',
  },
  {
    title: 'Trusted partnerships',
    description: 'We work closely with approved hospitals, pharmacies, and insurers to keep the network reliable and accessible.',
  },
  {
    title: 'Secure digital access',
    description: 'Every interaction is protected by enterprise-grade security protocols and transparent privacy standards.',
  },
];

const featuredServices = publicServices.slice(0, 3);

const HomePage: React.FC = () => (
  <div className="mx-auto max-w-6xl px-6 py-10 space-y-16">
    <section className="rounded-3xl border border-gray-200 bg-white px-8 py-10 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.5em] text-gov-accent">
        National Health Insurance Services
      </p>
      <h1 className="mt-4 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
        A modern gateway for NHISP citizens and service partners.
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Access coverage information, manage claims, and connect with advisors in a transparent, responsive space built for you.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/portal-access" className="btn-primary">
          Portal Access
        </Link>
        <Link to="/contact" className="btn-secondary">
          Need help?
        </Link>
      </div>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {heroHighlights.map((highlight) => (
          <li key={highlight} className="flex items-center gap-2 text-sm text-gray-500">
            <span className="h-2 w-2 rounded-full bg-gov-accent" aria-hidden />
            {highlight}
          </li>
        ))}
      </ul>
    </section>

    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {quickFacts.map((fact) => (
        <div
          key={fact.label}
          className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm"
        >
          <p className="text-3xl font-semibold text-gray-900">{fact.value}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.4em] text-gray-500">
            {fact.label}
          </p>
        </div>
      ))}
    </section>

    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-gov-accent">Why NHISP</p>
          <h2 className="mt-2 text-2xl font-semibold text-gray-900">How we keep citizens informed and protected</h2>
        </div>
        <Link to="/contact" className="text-sm font-semibold text-gov-accent hover:text-gov-accent/80">
          Contact an advisor
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {focusPoints.map((point) => (
          <div
            key={point.title}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900">{point.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{point.description}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Featured citizen services</h2>
        <Link to="/services" className="text-sm font-semibold text-gov-accent hover:text-gov-accent/80">
          View all services
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featuredServices.map((service) => (
          <article
            key={service.title}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden>
                {service.icon}
              </span>
              <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
            </div>
            <p className="mt-3 text-sm text-gray-600">{service.description}</p>
            <ul className="mt-4 space-y-1 text-sm text-gray-500">
              {service.highlights.map((highlight) => (
                <li key={highlight} className="flex items-center gap-2">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-gov-accent" aria-hidden />
                  {highlight}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>

    <section className="rounded-3xl border border-gov-medium bg-gradient-to-r from-gov-dark to-gov-medium p-10 text-white shadow-xl">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gov-accent/80">Ready to get started?</p>
          <h3 className="mt-2 text-2xl font-semibold">Use the NHISP portal for all your health insurance needs.</h3>
          <p className="mt-2 text-sm text-white/90">
            Log in once to manage policies, claims, payments, and support without visiting multiple offices.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            to="/portal-access"
            className="btn-primary bg-white text-gov-dark shadow-lg hover:bg-white/90 focus-visible:ring-white"
          >
            Access the portal
          </Link>
          <Link to="/services" className="btn-secondary">
            Explore services
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default HomePage;
