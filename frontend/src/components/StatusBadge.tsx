/**
 * StatusBadge Component
 * ======================
 * Renders claim status with appropriate color styling.
 */

import React from 'react';
import type { ClaimStatus } from '../api/types';

const statusClasses: Record<ClaimStatus, string> = {
  Submitted: 'badge-submitted',
  UnderReview: 'badge-under-review',
  Approved: 'badge-approved',
  Rejected: 'badge-rejected',
  Paid: 'badge-paid',
};

const statusLabels: Record<ClaimStatus, string> = {
  Submitted: 'Submitted',
  UnderReview: 'Under Review',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Paid: 'Paid',
};

interface StatusBadgeProps {
  status: ClaimStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return <span className={statusClasses[status]}>{statusLabels[status]}</span>;
};

export default StatusBadge;
