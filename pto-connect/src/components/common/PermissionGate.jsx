import React from 'react';
import { usePermissions } from '@/modules/hooks/usePermissions';

/**
 * PermissionGate component for conditional rendering based on user permissions
 * Integrates with the flexible permission system to show/hide UI elements
 */
export function PermissionGate({ 
  permission, 
  permissions, 
  fallback = null, 
  children,
  requireAll = false,
  showLoading = false,
  loadingComponent = null
}) {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    loading 
  } = usePermissions();

  // Show loading state if requested
  if (loading && showLoading) {
    return loadingComponent || (
      <div className="animate-pulse bg-gray-200 rounded h-4 w-24"></div>
    );
  }

  // Don't render anything while loading unless showLoading is true
  if (loading) {
    return null;
  }

  let hasAccess = false;

  if (permission) {
    // Single permission check
    hasAccess = hasPermission(permission);
  } else if (permissions && Array.isArray(permissions)) {
    // Multiple permissions check
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  } else {
    // No permission specified - deny access by default
    hasAccess = false;
  }

  return hasAccess ? children : fallback;
}

/**
 * Higher-order component version of PermissionGate
 * Useful for wrapping entire components
 */
export function withPermissionGate(WrappedComponent, permissionConfig) {
  return function PermissionWrappedComponent(props) {
    return (
      <PermissionGate {...permissionConfig}>
        <WrappedComponent {...props} />
      </PermissionGate>
    );
  };
}

/**
 * Hook for permission-based conditional logic
 * Useful when you need permission checks in component logic rather than rendering
 */
export function usePermissionCheck(permission, permissions, requireAll = false) {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    loading 
  } = usePermissions();

  if (loading) {
    return { hasAccess: false, loading: true };
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && Array.isArray(permissions)) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  }

  return { hasAccess, loading: false };
}

/**
 * Permission-aware button component
 * Automatically disables and shows tooltip when user lacks permission
 */
export function PermissionButton({ 
  permission, 
  permissions, 
  requireAll = false,
  children, 
  disabled = false,
  disabledMessage = "You don't have permission to perform this action",
  className = "",
  ...buttonProps 
}) {
  const { hasAccess, loading } = usePermissionCheck(permission, permissions, requireAll);
  
  const isDisabled = disabled || loading || !hasAccess;
  const buttonClass = `${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  
  const button = (
    <button
      {...buttonProps}
      disabled={isDisabled}
      className={buttonClass}
    >
      {loading ? 'Loading...' : children}
    </button>
  );

  // If user lacks permission, wrap with tooltip
  if (!loading && !hasAccess) {
    return (
      <div className="relative group">
        {button}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {disabledMessage}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    );
  }

  return button;
}

/**
 * Permission-aware link component
 * Shows as disabled text when user lacks permission
 */
export function PermissionLink({ 
  permission, 
  permissions, 
  requireAll = false,
  children, 
  href,
  className = "",
  disabledClassName = "text-gray-400 cursor-not-allowed",
  disabledMessage = "Access restricted",
  ...linkProps 
}) {
  const { hasAccess, loading } = usePermissionCheck(permission, permissions, requireAll);
  
  if (loading) {
    return <span className="text-gray-400">Loading...</span>;
  }

  if (!hasAccess) {
    return (
      <span 
        className={`${disabledClassName} relative group`}
        title={disabledMessage}
      >
        {children}
      </span>
    );
  }

  return (
    <a href={href} className={className} {...linkProps}>
      {children}
    </a>
  );
}

/**
 * Permission-aware navigation item
 * Useful for dynamic menu generation
 */
export function PermissionNavItem({ 
  permission, 
  permissions, 
  requireAll = false,
  children, 
  href,
  className = "",
  activeClassName = "",
  isActive = false,
  ...props 
}) {
  const { hasAccess, loading } = usePermissionCheck(permission, permissions, requireAll);
  
  if (loading || !hasAccess) {
    return null;
  }

  const navClass = `${className} ${isActive ? activeClassName : ''}`;

  return (
    <a href={href} className={navClass} {...props}>
      {children}
    </a>
  );
}

/**
 * Permission-aware section wrapper
 * Useful for hiding entire sections of the UI
 */
export function PermissionSection({ 
  permission, 
  permissions, 
  requireAll = false,
  children,
  fallback = null,
  className = "",
  emptyMessage = null
}) {
  const { hasAccess, loading } = usePermissionCheck(permission, permissions, requireAll);
  
  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="bg-gray-200 rounded h-20 w-full"></div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }
    
    if (emptyMessage) {
      return (
        <div className={`${className} text-center py-8 text-gray-500`}>
          {emptyMessage}
        </div>
      );
    }
    
    return null;
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
}

export default PermissionGate;
