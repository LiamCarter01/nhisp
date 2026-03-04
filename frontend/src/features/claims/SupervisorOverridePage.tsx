/**
 * Supervisor Override Page
 * ========================
 * Supervisors can override rejected claims back to approved.
 */

import React, { useEffect, useState } from 'react';
import { claimsApi } from '../../api/services';
import type { Claim } from '../../api/types';
import { LoadingSpinner, StatusBadge } from '../../components';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const SupervisorOverridePage: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [overridingId, setOverridingId] = useState<string | null>(null);
  const [overrideForm, setOverrideForm] = useState({
    amount_approved: '',
    notes: '',
  });

  const fetchRejected = async () => {
    try {
      const res = await claimsApi.rejected();
      setClaims(res.data.results);
    } catch {
      toast.error('Failed to load rejected claims.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejected();
  }, []);

  const handleOverride = async (claimId: string) => {
    if (!overrideForm.amount_approved) {
      toast.error('Please enter the approved amount.');
      return;
    }

    try {
      await claimsApi.override(claimId, {
        amount_approved: parseFloat(overrideForm.amount_approved),
        notes: overrideForm.notes,
      });
      toast.success('Claim overridden to Approved!');
      setOverridingId(null);
      setOverrideForm({ amount_approved: '', notes: '' });
      await fetchRejected();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error.response?.data?.error?.message || 'Override failed.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading rejected claims..." />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Supervisor Override</h1>
        <p className="text-gray-500 mt-1">
          Override rejected claims and escalate to approved status.
        </p>
      </div>

      {claims.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No rejected claims to override.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="card border-l-4 border-red-400">
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
                    Submitted: {dayjs(claim.submitted_at).format('MMM D, YYYY')}
                  </p>
                  {claim.reviewed_by_name && (
                    <p className="text-sm text-gray-500">
                      Rejected by: {claim.reviewed_by_name} on{' '}
                      {dayjs(claim.reviewed_at).format('MMM D, YYYY')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-800">
                    ${Number(claim.amount_requested).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Requested</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-2">{claim.description}</p>
              {claim.notes && (
                <p className="text-sm text-red-600 italic mb-4">Rejection notes: {claim.notes}</p>
              )}

              {overridingId === claim.id ? (
                <div className="border-t pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Approved Amount ($) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={overrideForm.amount_approved}
                        onChange={(e) =>
                          setOverrideForm({ ...overrideForm, amount_approved: e.target.value })
                        }
                        className="input-field"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Override Reason *
                    </label>
                    <textarea
                      rows={2}
                      value={overrideForm.notes}
                      onChange={(e) =>
                        setOverrideForm({ ...overrideForm, notes: e.target.value })
                      }
                      className="input-field"
                      placeholder="Reason for overriding this rejection..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOverride(claim.id)}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700"
                    >
                      Confirm Override
                    </button>
                    <button
                      onClick={() => {
                        setOverridingId(null);
                        setOverrideForm({ amount_approved: '', notes: '' });
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
                    onClick={() => setOverridingId(claim.id)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700"
                  >
                    Override to Approved
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

export default SupervisorOverridePage;
