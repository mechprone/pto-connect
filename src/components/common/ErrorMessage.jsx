import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ErrorMessage = ({ message, onRetry, className = '' }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-red-700">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-red-600 hover:text-red-800 font-medium text-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
