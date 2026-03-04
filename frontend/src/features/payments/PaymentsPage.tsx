/**
 * Payments Page
 * =============
 * View payments for approved claims.
 */

import React, { useEffect, useState } from 'react';
import { paymentsApi } from '../../api/services';
import type { Payment } from '../../api/types';
import { LoadingSpinner } from '../../components';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await paymentsApi.list();
        setPayments(res.data.results);
      } catch {
        toast.error('Failed to load payments.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) return <LoadingSpinner message="Loading payments..." />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
        <p className="text-gray-500 mt-1">Payment records for processed claims.</p>
      </div>

      {payments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No payments found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto card p-0">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Reference
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Claim</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Method</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Paid At</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-mono text-gray-800">
                    {p.payment_reference}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {p.claim_number}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-green-700">
                    ${Number(p.amount).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                    {p.payment_method?.replace('_', ' ') || 'Bank Transfer'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {p.paid_at ? dayjs(p.paid_at).format('MMM D, YYYY h:mm A') : '—'}
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

export default PaymentsPage;
