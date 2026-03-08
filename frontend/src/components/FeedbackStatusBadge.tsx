/**
 * FeedbackStatusBadge Component
 * ============================
 * Displays provider feedback moderation status with consistent styling.
 */

import React from 'react';
import type { ProviderFeedbackStatus } from '../api/types';

const statusClasses: Record<ProviderFeedbackStatus, string> = {
  Pending: 'badge badge-info',
  Approved: 'badge badge-approved',
  Rejected: 'badge badge-rejected',
};

const statusLabels: Record<ProviderFeedbackStatus, string> = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
};

interface FeedbackStatusBadgeProps {
  status: ProviderFeedbackStatus;
}

const FeedbackStatusBadge: React.FC<FeedbackStatusBadgeProps> = ({ status }) => (
  <span className={statusClasses[status]}>{statusLabels[status]}</span>
);

export default FeedbackStatusBadge;
