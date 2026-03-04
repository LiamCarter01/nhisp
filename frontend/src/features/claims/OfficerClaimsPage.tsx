/**
 * Officer Claims Review Page
 * ============================
 * Claims officers review and transition claim statuses.
 */

import React, { useEffect, useState } from 'react';
import { claimsApi } from '../../api/services';
import type { Claim, ClaimStatus } from '../../api/types';
import { LoadingSpinner, StatusBadge } from '../../components';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const OfficerClaimsPage: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({
    status: '' as ClaimStatus | '',
    amount_approved: '',
    notes: '',
  });

  const fetchClaims = async () => {
    try {
      const res = await claimsApi.pending();
      setClaims(res.data.results);
    } catch {
      toast.error('Failed to load claims.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleReview = async (claimId: string) => {
    if (!reviewForm.status) {
      toast.error('Please select a status.');
      return;
    }

    try {
      await claimsApi.review(claimId, {
        status: reviewForm.status as 'UnderReview' | 'Approved' | 'Rejected',
        amount_approved: reviewForm.amount_approved
          ? parseFloat(reviewForm.amount_approved)
          : undefined,
        notes: reviewForm.notes,
      });
      toast.success('Claim reviewed successfully!');
      setReviewingId(null);
      setReviewForm({ status: '', amount_approved: '', notes: '' });
      await fetchClaims();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error.response?.data?.error?.message || 'Failed to review claim.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading claims for review..." />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Review Claims</h1>
        <p className="text-gray-500 mt-1">Review and process pending insurance claims.</p>
      </div>

      {claims.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No claims pending review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-800">{claim.claim_number}</h3>
                    <StatusBadge status={claim.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    Citizen: {claim.citizen_name} | Policy: {claim.policy_number}
                  </p>
                  <p className="text-sm text-gray-500">
                    Submitted: {dayjs(claim.submitted_at).format('MMM D, YYYY h:mm A')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-800">
                    ${Number(claim.amount_requested).toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{claim.description}</p>

              {reviewingId === claim.id ? (
                <div className="border-t pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Status *
                      </label>
                      <select
                        value={reviewForm.status}
                        onChange={(e) =>
                          setReviewForm({ ...reviewForm, status: e.target.value as ClaimStatus })
                        }
                        className="input-field"
                      >
                        <option value="">-- Select --</option>
                        {claim.status === 'Submitted' && (
                          <option value="UnderReview">Under Review</option>
                        )}
                        {(claim.status === 'Submitted' || claim.status === 'UnderReview') && (
                          <>
                            <option value="Approved">Approve</option>
                            <option value="Rejected">Reject</option>
                          </>
                        )}
                      </select>
                    </div>

                    {reviewForm.status === 'Approved' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Approved Amount ($) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={reviewForm.amount_approved}
                          onChange={(e) =>
                            setReviewForm({ ...reviewForm, amount_approved: e.target.value })
                          }
                          className="input-field"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      rows={2}
                      value={reviewForm.notes}
                      onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                      className="input-field"
                      placeholder="Review notes..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleReview(claim.id)} className="btn-primary">
                      Submit Review
                    </button>
                    <button
                      onClick={() => {
                        setReviewingId(null);
                        setReviewForm({ status: '', amount_approved: '', notes: '' });
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t pt-3">
                  <button
                    onClick={() => setReviewingId(claim.id)}
                    className="btn-primary text-sm"
                  >
                    Review This Claim
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfficerClaimsPage;
