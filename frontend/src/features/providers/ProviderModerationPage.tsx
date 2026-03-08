/**
 * Provider Moderation Page
 * ========================
 * Staff can review and moderate citizen feedback entries.
 */

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { providersApi } from '../../api/services';
import type { ProviderFeedbackManagement, ProviderFeedbackStatus } from '../../api/types';
import { FeedbackStatusBadge, LoadingSpinner } from '../../components';

const statusOptions: (ProviderFeedbackStatus | '')[] = ['', 'Pending', 'Approved', 'Rejected'];

const ProviderModerationPage: React.FC = () => {
  const [feedback, setFeedback] = useState<ProviderFeedbackManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<ProviderFeedbackStatus | ''>('');
  const [filterProvider, setFilterProvider] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ status: '', provider: '' });
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedback({ status: '', provider: '' });
  }, []);

  const fetchFeedback = async (filters: { status: ProviderFeedbackStatus | ''; provider: string }) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.provider) {
        params.provider = filters.provider;
      }

      const response = await providersApi.listFeedback(
        Object.keys(params).length ? (params as { status?: ProviderFeedbackStatus; provider?: string }) : undefined,
      );
      setFeedback(response.data.results);
    } catch {
      toast.error('Failed to load feedback entries.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    const trimmedProvider = filterProvider.trim();
    const filters = { status: filterStatus, provider: trimmedProvider };
    setAppliedFilters(filters);
    fetchFeedback(filters);
  };

  const handleModerate = async (entryId: string, status: ProviderFeedbackStatus) => {
    setModeratingId(entryId);
    try {
      await providersApi.moderateFeedback(entryId, status);
      toast.success('Feedback updated successfully.');
      fetchFeedback(appliedFilters);
    } catch {
      toast.error('Failed to update feedback status.');
    } finally {
      setModeratingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Feedback Moderation</h1>
        <p className="text-gray-500 mt-1">
          Review citizen feedback and approve or reject entries before making them public.
        </p>
      </div>

      <div className="card mb-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-500">Status Filter</label>
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value as ProviderFeedbackStatus | '')}
            className="input-field max-w-[200px]"
          >
            {statusOptions.map((option) => (
              <option key={option || 'all'} value={option}>
                {option || 'All'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Provider Filter</label>
          <input
            className="input-field max-w-md"
            placeholder="Search by provider ID or name"
            value={filterProvider}
            onChange={(event) => setFilterProvider(event.target.value)}
          />
        </div>
        <div>
          <button type="button" className="btn-primary" onClick={handleApplyFilters}>
            Apply Filters
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading feedback entries..." />
      ) : feedback.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No feedback entries match the current filters.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Citizen
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedback.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{entry.provider_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {entry.citizen_name}
                    <br />
                    <span className="text-xs text-gray-500">{entry.citizen_email}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{entry.rating_score} / 5</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{entry.comment}</td>
                  <td className="px-4 py-3">
                    <FeedbackStatusBadge status={entry.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {dayjs(entry.created_at).format('MMM D, YYYY h:mm A')}
                  </td>
                  <td className="px-4 py-3 space-y-2">
                    <button
                      type="button"
                      className="btn-success w-full"
                      disabled={entry.status === 'Approved' || moderatingId === entry.id}
                      onClick={() => handleModerate(entry.id, 'Approved')}
                    >
                      {moderatingId === entry.id && entry.status !== 'Approved' ? 'Updating...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      className="btn-danger w-full"
                      disabled={entry.status === 'Rejected' || moderatingId === entry.id}
                      onClick={() => handleModerate(entry.id, 'Rejected')}
                    >
                      {moderatingId === entry.id && entry.status !== 'Rejected' ? 'Updating...' : 'Reject'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProviderModerationPage;
