/**
 * Providers Page
 * ==============
 * View registered healthcare providers.
 */

import React, { useEffect, useState } from 'react';
import { providersApi } from '../../api/services';
import type { Provider } from '../../api/types';
import { LoadingSpinner } from '../../components';
import toast from 'react-hot-toast';

const ProvidersPage: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await providersApi.list();
        setProviders(res.data.results);
      } catch {
        toast.error('Failed to load providers.');
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  const providerIcons: Record<string, string> = {
    Hospital: '🏥',
    Clinic: '🩺',
    Pharmacy: '💊',
    Lab: '🔬',
    Specialist: '👨‍⚕️',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Healthcare Providers</h1>
        <p className="text-gray-500 mt-1">Registered healthcare providers in the network.</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading providers..." />
      ) : providers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No providers registered.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => (
            <div key={provider.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {providerIcons[provider.provider_type] || '🏢'}
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{provider.name}</h3>
                  <p className="text-sm text-gray-500">{provider.provider_type}</p>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    License: {provider.license_number}
                  </p>
                  {provider.address && (
                    <p className="text-xs text-gray-500 mt-1">{provider.address}</p>
                  )}
                </div>
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                    provider.active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {provider.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProvidersPage;
