/**
 * Policies List Page
 * ===================
 * View insurance policies (citizens see their own, admin sees all).
 */

import React, { useEffect, useState, useMemo } from 'react';
import { policiesApi } from '../../api/services';
import type { Policy } from '../../api/types';
import { LoadingSpinner, DataTable } from '../../components';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

// Extend Policy to satisfy the Record<string, unknown> constraint
type PolicyRecord = Policy & Record<string, unknown>;

const PoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch policies on component mount
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await policiesApi.list();
        // Cast the fetched data to PolicyRecord[]
        setPolicies(res.data.results as PolicyRecord[]);
      } catch (error) {
        console.error('Error fetching policies:', error);
        toast.error('Failed to load policies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  // Define table columns with memoization to prevent unnecessary re-renders
  const columns = useMemo(
    () => [
      { key: 'policy_number', header: 'Policy #' },
      { key: 'coverage_type', header: 'Coverage' },
      {
        key: 'start_date',
        header: 'Start Date',
        render: (item: PolicyRecord) => dayjs(item.start_date).format('MMM D, YYYY'),
      },
      {
        key: 'end_date',
        header: 'End Date',
        render: (item: PolicyRecord) => dayjs(item.end_date).format('MMM D, YYYY'),
      },
      {
        key: 'max_coverage_amount',
        header: 'Max Coverage',
        render: (item: PolicyRecord) => `$${Number(item.max_coverage_amount).toLocaleString()}`,
      },
      {
        key: 'active',
        header: 'Status',
        render: (item: PolicyRecord) =>
          item.active ? (
            <span className="badge bg-green-100 text-green-800">Active</span>
          ) : (
            <span className="badge bg-gray-100 text-gray-800">Inactive</span>
          ),
      },
    ],
    []
  );

  // Show loading spinner while data is being fetched
  if (loading) {
    return <LoadingSpinner message="Loading policies..." />;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Insurance Policies</h1>
        <p className="text-gray-500 mt-1">View and manage your insurance policies.</p>
      </div>

      {/* Policies Table */}
      <div className="card">
        <DataTable<PolicyRecord>
          columns={columns}
          data={policies}
          keyField="id"
          emptyMessage="No policies found."
          aria-label="Insurance Policies Table"
        />
      </div>
    </div>
  );
};

export default PoliciesPage;
