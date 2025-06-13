import React from 'react';

export default function Card({
  title,
  description,
  children,
  className = '',
  ...props
}) {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md overflow-hidden
        ${className}
      `}
      {...props}
    >
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
} 