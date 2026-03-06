import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initialFormValues: ContactFormValues = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

const contactChannels = [
  {
    label: 'Visit our office',
    value: '123 Unity Avenue, Capital City',
    icon: '📍',
  },
  {
    label: 'General inquiries',
    value: 'support@nhisp.gov',
    icon: '✉️',
    link: 'mailto:support@nhisp.gov',
  },
  {
    label: 'Phone support',
    value: '+971 800 364 746',
    icon: '📞',
    link: 'tel:+971800364746',
  },
  {
    label: 'Operating hours',
    value: 'Saturday - Thursday · 8:00 AM – 8:00 PM',
    icon: '⏰',
  },
];

const ContactPage: React.FC = () => {
  const [formValues, setFormValues] = useState<ContactFormValues>(initialFormValues);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setFormValues(initialFormValues);
      toast.success('Message received. We will respond within 48 hours.');
    }, 600);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-[1.2fr,1fr]">
        <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-gov-accent">Get in touch</p>
            <h1 className="mt-3 text-3xl font-bold text-gray-900">We are here to help</h1>
            <p className="mt-2 text-gray-600">
              Send us your questions or request assistance with claims, benefits, or account access and the NHISP support team
              will follow up as quickly as possible.
            </p>
          </div>
          <div className="space-y-4">
            {contactChannels.map((channel) => (
              <div key={channel.label} className="space-y-1">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span>{channel.icon}</span>
                  {channel.label}
                </p>
                {channel.link ? (
                  <a className="text-base font-medium text-gov-accent" href={channel.link}>
                    {channel.value}
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">{channel.value}</p>
                )}
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-gov-accent/30 bg-gov-dark px-4 py-3 text-sm text-white">
            <p className="text-sm font-semibold">Emergency hotline</p>
            <p className="text-lg font-semibold">+971 800 364 746</p>
            <p className="text-sm text-white/90">Available Saturday – Thursday · 8:00 AM – 8:00 PM</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formValues.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gov-accent focus:ring-gov-accent"
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
              value={formValues.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gov-accent focus:ring-gov-accent"
            />
          </div>
          <div>
            <label htmlFor="subject" className="text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              value={formValues.subject}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gov-accent focus:ring-gov-accent"
            />
          </div>
          <div>
            <label htmlFor="message" className="text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={formValues.message}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gov-accent focus:ring-gov-accent"
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send message'}
          </button>
          <p className="text-xs text-gray-500">
            Need immediate assistance? <Link className="font-semibold text-gov-accent" to="/portal-access">Visit Portal Access</Link> to continue to the secure login.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
