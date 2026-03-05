import React from 'react';
import { Link } from 'react-router-dom';

const ContactPage: React.FC = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="space-y-6 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-gov-dark">Contact</p>
          <h1 className="text-4xl font-semibold text-gray-900">Speak with the NHISP team</h1>
          <p className="text-gray-600">
            Our dedicated staff stands ready to answer questions, share outreach schedules, and guide citizens through portal registration.
          </p>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-lg font-semibold text-gray-900">Office hours</p>
            <p className="text-sm text-gray-600">
              Monday to Friday, 8:00 AM – 6:00 PM (Local Time)
            </p>

            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400">Address</p>
                <p>123 Global Health Avenue, Capital City, NH 10001</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400">Email</p>
                <a href="mailto:info@nhisp.gov" className="text-gov-accent">
                  info@nhisp.gov
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400">Phone</p>
                <a href="tel:+18005550199" className="text-gov-accent">
                  +1 (800) 555-0199
                </a>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Prefer to log into your account?{' '}
              <Link to="/login" className="font-semibold text-gov-accent">
                Sign in
              </Link>
              {' '}for immediate service delivery.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm"
          >
            <div>
              <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="input-field mt-1"
                placeholder="e.g. Amina Farah"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field mt-1"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                className="input-field mt-1 min-h-[120px]"
                placeholder="Let us know how we can help."
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Send message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;