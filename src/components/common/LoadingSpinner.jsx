import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'default', className = '' }) {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-6 w-6',
    large: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`animate-spin text-blue-600 ${sizeClasses[size]} ${className}`} />
    </div>
  );
} 