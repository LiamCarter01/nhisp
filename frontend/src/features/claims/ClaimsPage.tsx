/**
 * Claims List Page
 * =================
 * Citizens view their own claims.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { claimsApi } from '../../api/services';
import type { Claim } from '../../api/types';
import { LoadingSpinner, StatusBadge } from '../../components';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const ClaimsPage: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await claimsApi.list();
        setClaims(res.data.results);
      } catch {
        toast.error('Failed to load claims.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner message="Loading claims..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Claims</h1>
          <p className="text-gray-500 mt-1">View and track your insurance claims.</p>
        </div>
        <Link to="/claims/new" className="btn-primary">
          + Submit New Claim
        </Link>
      </div>

      {claims.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">You have no claims yet.</p>
          <Link to="/claims/new" className="btn-primary">Submit Your First Claim</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="card flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-800">{claim.claim_number}</h3>
                  <StatusBadge status={claim.status} />
                </div>
                <p className="text-sm text-gray-500">
                  Policy: {claim.policy_number} | Submitted: {dayjs(claim.submitted_at).format('MMM D, YYYY')}
                </p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{claim.description}</p>
              </div>
              <div className="text-right ml-4">
                <p className="text-lg font-semibold text-gray-800">
                  ${Number(claim.amount_requested).toLocaleString()}
                </p>
                {claim.amount_approved && (
                  <p className="text-sm text-green-600">
                    Approved: ${Number(claim.amount_approved).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClaimsPage;
