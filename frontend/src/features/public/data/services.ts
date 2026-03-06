export interface PublicService {
  title: string;
  description: string;
  highlights: string[];
  icon: string;
}

export const publicServices: PublicService[] = [
  {
    title: 'Health Insurance Policies',
    description: 'Explore individual, family, and employer-sponsored coverage options with transparent terms.',
    highlights: [
      'Compare policy tiers and benefits side by side',
      'Download confirmation letters instantly',
      'Understand eligibility requirements clearly',
    ],
    icon: '🛡️',
  },
  {
    title: 'Claims & Reimbursements',
    description: 'Submit supporting documents, monitor review stages, and receive automated updates on your claims.',
    highlights: [
      'Upload documents securely from any device',
      'Track review progress in real time',
      'Receive SMS and email notifications throughout the process',
    ],
    icon: '📄',
  },
  {
    title: 'Provider Network',
    description: 'Locate verified hospitals, clinics, and pharmacies that partner with NHISP.',
    highlights: [
      'Search by specialty, location, or language',
      'View facility operating hours and direct contact details',
      'Save preferred providers for quick access',
    ],
    icon: '🏥',
  },
  {
    title: 'Payments & Contributions',
    description: 'Manage premium contributions, download receipts, and set up reminders for upcoming dues.',
    highlights: [
      'Make secure payments right inside the portal',
      'Download official payment receipts instantly',
      'Enable automated reminders to avoid missed deadlines',
    ],
    icon: '💳',
  },
];
