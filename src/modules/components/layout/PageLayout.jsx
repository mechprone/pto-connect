import React from 'react';
import { Outlet } from 'react-router-dom';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function PageLayout({ 
  title,
  loading = false,
  error = null,
  children,
  className = ''
}) {
  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {title && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
      )}
      {children || <Outlet />}
    </div>
  );
} 