/**
 * Providers Page
 * ==============
 * View registered healthcare providers and submit ratings/feedback.
 */

import React, { useEffect, useState } from 'react';
import { providersApi } from '../../api/services';
import type { Provider } from '../../api/types';
import { LoadingSpinner } from '../../components';
import toast from 'react-hot-toast';
import { useHasRole } from '../../hooks';

const providerIcons: Record<string, string> = {
  Hospital: '🏥',
  Clinic: '🩺',
  Pharmacy: '💊',
  Laboratory: '🔬',
  Specialist: '👨‍⚕️',
};

const defaultFormValues = {
  rating_score: 5,
  comment: '',
};

const ProvidersPage: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<Record<string, { rating_score: number; comment: string }>>({});
  const [submittingProvider, setSubmittingProvider] = useState<string | null>(null);
  const isCitizen = useHasRole('Citizen');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const response = await providersApi.list();
      setProviders(response.data.results);
    } catch (error) {
      toast.error('Failed to load providers.');
    } finally {
      setLoading(false);
    }
  };

  const getFormValues = (providerId: string) => {
    return formState[providerId] ?? defaultFormValues;
  };

  const handleRatingChange = (providerId: string, score: number) => {
    setFormState((prev) => ({
      ...prev,
      [providerId]: {
        ...getFormValues(providerId),
        rating_score: score,
      },
    }));
  };

  const handleCommentChange = (providerId: string, comment: string) => {
    setFormState((prev) => ({
      ...prev,
      [providerId]: {
        ...getFormValues(providerId),
        comment,
      },
    }));
  };

  const handleSubmitFeedback = async (providerId: string) => {
    const { rating_score, comment } = getFormValues(providerId);
    if (!comment.trim()) {
      toast.error('Please add a comment before submitting.');
      return;
    }

    setSubmittingProvider(providerId);
    try {
      await providersApi.submitFeedback(providerId, {
        rating_score,
        comment: comment.trim(),
      });
      toast.success('Feedback submitted and awaiting moderation.');
      setFormState((prev) => ({
        ...prev,
        [providerId]: { ...defaultFormValues },
      }));
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingProvider(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Healthcare Providers</h1>
        <p className="text-gray-500 mt-1">Browse providers, see their ratings, and submit feedback.</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading providers..." />
      ) : providers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No providers registered.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => {
            const averageRating = provider.average_rating
              ? Number(provider.average_rating).toFixed(1)
              : null;
            const { rating_score, comment } = getFormValues(provider.id);

            return (
              <div key={provider.id} className="card flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{providerIcons[provider.provider_type] || '🏢'}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">{provider.name}</h3>
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          provider.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {provider.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{provider.provider_type}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">License: {provider.license_number}</p>
                    {provider.address && (
                      <p className="text-xs text-gray-500 mt-1">{provider.address}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">
                    Average Rating:{' '}
                    <span className="text-lg text-gray-800 font-semibold">
                      {averageRating ?? 'N/A'}{averageRating ? ' ★' : ''}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {provider.approved_feedback_count} {provider.approved_feedback_count === 1 ? 'review' : 'reviews'}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Recent Feedback</h4>
                  {provider.feedback_preview.length === 0 ? (
                    <p className="text-xs text-gray-500">No approved feedback yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {provider.feedback_preview.map((entry) => (
                        <li
                          key={entry.id}
                          className="rounded-md border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700"
                        >
                          <p>{entry.comment}</p>
                          <p className="text-xs text-gray-500 mt-1">Rating: {entry.rating_score} / 5</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {isCitizen && (
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">Submit Feedback</h4>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Rating</label>
                      <select
                        value={rating_score}
                        onChange={(event) =>
                          handleRatingChange(provider.id, Number(event.target.value))
                        }
                        className="input-field max-w-[140px]"
                      >
                        {[5, 4, 3, 2, 1].map((score) => (
                          <option key={score} value={score}>
                            {score} Star{score > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Comment</label>
                      <textarea
                        className="input-field min-h-[90px]"
                        placeholder="Share your experience..."
                        value={comment}
                        onChange={(event) =>
                          handleCommentChange(provider.id, event.target.value)
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className="btn-primary w-full"
                      disabled={submittingProvider === provider.id}
                      onClick={() => handleSubmitFeedback(provider.id)}
                    >
                      {submittingProvider === provider.id ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                    <p className="text-xs text-gray-500">
                      Feedback is reviewed by staff before being visible to other citizens.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProvidersPage;
