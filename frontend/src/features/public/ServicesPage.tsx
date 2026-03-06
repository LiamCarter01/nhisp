import React from 'react';
import { Link } from 'react-router-dom';
import { publicServices } from './data/services';

const ServicesPage: React.FC = () => (
  <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
    <header className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.4em] text-gov-accent">Services</p>
      <h1 className="text-3xl font-bold text-gray-900">Comprehensive citizen services in one secure portal</h1>
      <p className="text-gray-600">
        NHISP brings policy information, claims management, provider search, and payments together in a coherent, responsive
        experience.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link to="/portal-access" className="btn-primary">
          Portal Access
        </Link>
        <Link to="/contact" className="btn-secondary">
          Contact support
        </Link>
      </div>
    </header>

    <div className="grid gap-6 md:grid-cols-2">
      {publicServices.map((service) => (
        <article
          key={service.title}
          className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center gap-3 text-2xl">
            <span aria-hidden>{service.icon}</span>
            <h2 className="text-xl font-semibold text-gray-900">{service.title}</h2>
          </div>
          <p className="mt-3 text-sm text-gray-600">{service.description}</p>
          <ul className="mt-5 space-y-1 text-sm text-gray-500">
            {service.highlights.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gov-accent" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
            <p>Need help?</p>
            <Link to="/contact" className="font-semibold text-gov-accent hover:text-gov-accent/80">
              Speak to an advisor
            </Link>
          </div>
        </article>
      ))}
    </div>
  </div>
);

export default ServicesPage;
