/**
 * My Feedback Page
 * =================
 * Citizens can track the status of their submitted feedback.
 */

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { providersApi } from '../../api/services';
import type { ProviderFeedbackCitizen } from '../../api/types';
import { FeedbackStatusBadge, LoadingSpinner } from '../../components';

const MyFeedbackPage: React.FC = () => {
  const [feedback, setFeedback] = useState<ProviderFeedbackCitizen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await providersApi.myFeedback();
      setFeedback(response.data.data);
    } catch {
      toast.error('Failed to load your feedback.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your feedback..." />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Feedback</h1>
        <p className="text-gray-500 mt-1">Track the status of feedback you submitted for providers.</p>
      </div>

      {feedback.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">You haven’t submitted any feedback yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((entry) => (
            <div key={entry.id} className="card space-y-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800">{entry.provider_name}</p>
                  <FeedbackStatusBadge status={entry.status} />
                </div>
                <p className="text-xs text-gray-500">
                  Submitted on {dayjs(entry.created_at).format('MMM D, YYYY')} &middot; Rating {entry.rating_score} / 5
                </p>
              </div>
              <p className="text-sm text-gray-700">{entry.comment}</p>
              {entry.moderated_at && (
                <p className="text-xs text-gray-500">
                  Moderated on {dayjs(entry.moderated_at).format('MMM D, YYYY h:mm A')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFeedbackPage;
