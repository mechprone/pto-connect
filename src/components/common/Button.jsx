import React from 'react';

export default function Button({
  children,
  variant = 'default', // 'default', 'outline', 'danger'
  className = '',
  disabled = false,
  fullWidth = false,
  ...props
}) {
  let base =
    'inline-flex items-center justify-center px-4 py-2 rounded font-medium focus:outline-none transition';
  let color = '';
  switch (variant) {
    case 'outline':
      color = 'border border-blue-600 text-blue-600 bg-white hover:bg-blue-50';
      break;
    case 'danger':
      color = 'bg-red-600 text-white hover:bg-red-700';
      break;
    default:
      color = 'bg-blue-600 text-white hover:bg-blue-700';
  }
  let disabledStyle = disabled ? 'opacity-50 cursor-not-allowed' : '';
  let width = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${base} ${color} ${disabledStyle} ${width} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
} 