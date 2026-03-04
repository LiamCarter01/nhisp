/**
 * LoadingSpinner Component
 */

import React from 'react';

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gov-accent mb-4"></div>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
