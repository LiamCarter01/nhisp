/**
 * Providers Page
 * ==============
 * View registered healthcare providers and their feedback.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { LoadingSpinner } from '../../components';
import { providerFeedbackApi, providersApi } from '../../api/services';
import type {
  FeedbackStatus,
  Provider,
  ProviderFeedback,
  ProviderFeedbackCreateRequest,
} from '../../api/types';
import { useHasRole } from '../../hooks';
import toast from 'react-hot-toast';

const RATING_MAX = 5;

const renderRatingStars = (value?: number | null) => {
  const rating = value ? Math.round(value) : 0;
  return Array.from({ length: RATING_MAX }, (_, index) => (
    <span key={index} className="text-gov-accent text-base">
      {index < rating ? '★' : '☆'}
    </span>
  ));
};

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return value;
  }
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const typedError = error as { response?: { data?: { error?: { message?: string } } } };
  return typedError.response?.data?.error?.message || fallback;
};

const ProvidersPage: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [formProviderId, setFormProviderId] = useState<string | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating_score: 5, comment: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [pendingFeedback, setPendingFeedback] = useState<ProviderFeedback[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [moderatingIds, setModeratingIds] = useState<string[]>([]);

  const isCitizen = useHasRole('Citizen');
  const isAdmin = useHasRole('Admin');
  const isSupervisor = useHasRole('Supervisor');
  const isClaimsOfficer = useHasRole('ClaimsOfficer');
  const isStaff = isAdmin || isSupervisor || isClaimsOfficer;

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await providersApi.list();
      setProviders(response.data.results);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load providers.'));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingFeedback = useCallback(async () => {
    if (!isStaff) {
      setPendingFeedback([]);
      return;
    }
    setPendingLoading(true);
    try {
      const response = await providerFeedbackApi.list({ status: 'Pending' });
      setPendingFeedback(response.data.results);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load pending feedback.'));
    } finally {
      setPendingLoading(false);
    }
  }, [isStaff]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  useEffect(() => {
    fetchPendingFeedback();
  }, [fetchPendingFeedback]);

  const handleFormToggle = (providerId: string) => {
    if (formProviderId === providerId) {
      setFormProviderId(null);
      return;
    }
    setFormProviderId(providerId);
    setFeedbackForm({ rating_score: 5, comment: '' });
  };

  const handleFeedbackSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formProviderId) return;
    if (!feedbackForm.comment.trim()) {
      toast.error('Please enter your feedback comment.');
      return;
    }
    setSubmittingFeedback(true);
    try {
      const payload: ProviderFeedbackCreateRequest = {
        provider: formProviderId,
        rating_score: feedbackForm.rating_score,
        comment: feedbackForm.comment.trim(),
      };
      await providerFeedbackApi.create(payload);
      toast.success('Feedback submitted for moderation.');
      setFormProviderId(null);
      setFeedbackForm({ rating_score: 5, comment: '' });
      await fetchProviders();
      await fetchPendingFeedback();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to submit feedback.'));
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleModeration = async (feedbackId: string, status: FeedbackStatus) => {
    setModeratingIds((prev) => [...prev, feedbackId]);
    try {
      await providerFeedbackApi.moderate(feedbackId, { status });
      toast.success(`Feedback ${status.toLowerCase()} successfully.`);
      await fetchProviders();
      await fetchPendingFeedback();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update feedback.'));
    } finally {
      setModeratingIds((prev) => prev.filter((id) => id !== feedbackId));
    }
  };

  const isModerating = (id: string) => moderatingIds.includes(id);

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

      {isStaff && (
        <section className="card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Pending Feedback</h2>
              <p className="text-sm text-gray-500">Staff can approve or reject new submissions.</p>
            </div>
            <button
              onClick={fetchPendingFeedback}
              disabled={pendingLoading}
              className="btn-secondary text-sm"
            >
              Refresh
            </button>
          </div>
          <div className="mt-4">
            {pendingLoading ? (
              <LoadingSpinner message="Loading pending feedback..." />
            ) : pendingFeedback.length === 0 ? (
              <p className="text-sm text-gray-500">No feedback awaiting moderation.</p>
            ) : (
              <div className="space-y-3">
                {pendingFeedback.map((feedback) => (
                  <div key={feedback.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{feedback.provider_name}</p>
                        <p className="text-xs text-gray-500">
                          Submitted by {feedback.user_name} on {formatDate(feedback.created_at)}
                        </p>
                      </div>
                      <span className="text-sm text-gray-700">{feedback.rating_score}/5</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{feedback.comment}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        disabled={isModerating(feedback.id)}
                        onClick={() => handleModeration(feedback.id, 'Approved')}
                        className="btn-success btn-sm"
                      >
                        Approve
                      </button>
                      <button
                        disabled={isModerating(feedback.id)}
                        onClick={() => handleModeration(feedback.id, 'Rejected')}
                        className="btn-danger btn-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

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

              <div className="mt-4 border-t pt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">{renderRatingStars(provider.average_rating)}</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {typeof provider.average_rating === 'number'
                      ? provider.average_rating.toFixed(1)
                      : 'No ratings yet'}
                  </div>
                  {typeof provider.feedback_count === 'number' && (
                    <span className="text-xs text-gray-500">({provider.feedback_count} feedback)</span>
                  )}
                </div>

                <div className="space-y-3">
                  {provider.recent_feedbacks && provider.recent_feedbacks.length > 0 ? (
                    provider.recent_feedbacks.map((feedback) => (
                      <div key={feedback.id} className="rounded-md border border-gray-200 p-3 bg-white">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-800">{feedback.user_name}</p>
                          <span className="text-xs text-gray-500">{formatDate(feedback.created_at)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{feedback.comment}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                          <span className="flex items-center text-gov-accent">
                            {renderRatingStars(feedback.rating_score)}
                          </span>
                          <span>{feedback.rating_score}/5</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No feedback yet.</p>
                  )}
                </div>

                {isCitizen && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">Submit Feedback</p>
                      <button
                        type="button"
                        onClick={() => handleFormToggle(provider.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {formProviderId === provider.id ? 'Hide form' : 'Leave feedback'}
                      </button>
                    </div>
                    {formProviderId === provider.id && (
                      <form onSubmit={handleFeedbackSubmit} className="mt-3 space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600" htmlFor="rating_score">
                            Rating
                          </label>
                          <select
                            id="rating_score"
                            value={feedbackForm.rating_score}
                            onChange={(event) =>
                              setFeedbackForm((prev) => ({
                                ...prev,
                                rating_score: Number(event.target.value),
                              }))
                            }
                            className="input-field mt-1"
                          >
                            {Array.from({ length: RATING_MAX }, (_, index) => index + 1).map((rating) => (
                              <option key={rating} value={rating}>
                                {rating} Star{rating > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600" htmlFor="feedback_comment">
                            Comment
                          </label>
                          <textarea
                            id="feedback_comment"
                            rows={3}
                            value={feedbackForm.comment}
                            onChange={(event) =>
                              setFeedbackForm((prev) => ({ ...prev, comment: event.target.value }))
                            }
                            className="input-field mt-1"
                            placeholder="Share what stood out about your experience."
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="submit" disabled={submittingFeedback} className="btn-primary">
                            {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormProviderId(null)}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProvidersPage;
