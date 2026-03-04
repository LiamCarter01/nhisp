/**
 * Submit Claim Page
 * ==================
 * Form for citizens to submit new insurance claims.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { policiesApi, claimsApi } from '../../api/services';
import type { Policy } from '../../api/types';
import { LoadingSpinner } from '../../components';
import toast from 'react-hot-toast';

const SubmitClaimPage: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    policy: '',
    amount_requested: '',
    description: '',
    diagnosis_code: '',
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await policiesApi.list();
        // Only show active, valid policies
        const validPolicies = res.data.results.filter((p: Policy) => p.active);
        setPolicies(validPolicies);
      } catch {
        toast.error('Failed to load policies.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.policy || !formData.amount_requested || !formData.description) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await claimsApi.create({
        policy: formData.policy,
        amount_requested: parseFloat(formData.amount_requested),
        description: formData.description,
        diagnosis_code: formData.diagnosis_code,
      });
      toast.success('Claim submitted successfully!');
      navigate('/claims');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error.response?.data?.error?.message || 'Failed to submit claim.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading policies..." />;

  const selectedPolicy = policies.find((p) => p.id === formData.policy);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Submit New Claim</h1>
        <p className="text-gray-500 mt-1">Fill in the details to submit an insurance claim.</p>
      </div>

      {policies.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">No active policies found. You need an active policy to submit a claim.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Policy Selection */}
          <div>
            <label htmlFor="policy" className="block text-sm font-medium text-gray-700 mb-1">
              Select Policy *
            </label>
            <select
              id="policy"
              name="policy"
              value={formData.policy}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">-- Select a policy --</option>
              {policies.map((policy) => (
                <option key={policy.id} value={policy.id}>
                  {policy.policy_number} - {policy.coverage_type} (Max: ${Number(policy.max_coverage_amount).toLocaleString()})
                </option>
              ))}
            </select>
            {selectedPolicy && (
              <p className="text-xs text-gray-500 mt-1">
                Coverage: {selectedPolicy.coverage_type} | Valid until: {selectedPolicy.end_date}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount_requested" className="block text-sm font-medium text-gray-700 mb-1">
              Amount Requested ($) *
            </label>
            <input
              id="amount_requested"
              name="amount_requested"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount_requested}
              onChange={handleChange}
              className="input-field"
              placeholder="0.00"
              required
            />
            {selectedPolicy && (
              <p className="text-xs text-gray-500 mt-1">
                Maximum coverage: ${Number(selectedPolicy.max_coverage_amount).toLocaleString()}
              </p>
            )}
          </div>

          {/* Diagnosis Code */}
          <div>
            <label htmlFor="diagnosis_code" className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis Code (ICD-10)
            </label>
            <input
              id="diagnosis_code"
              name="diagnosis_code"
              type="text"
              value={formData.diagnosis_code}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., J06.9"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              placeholder="Describe the medical services or treatments..."
              required
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-4">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting...' : 'Submit Claim'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/claims')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SubmitClaimPage;
