
import { useUserProfile } from './useUserProfile';

export function useRoleAccess() {
  const { profile, organization, loading } = useUserProfile();

  // Role hierarchy for permission checking
  const roleHierarchy = {
    'admin': 5,
    'board_member': 4,
    'committee_lead': 3,
    'volunteer': 2,
    'parent_member': 1,
    'teacher': 1
  };

  /**
   * Check if user has a specific role or higher
   * @param {string} requiredRole - The minimum role required
   * @returns {boolean} - True if user has required role or higher
   */
  const hasRole = (requiredRole) => {
    if (!profile?.role) return false;
    return roleHierarchy[profile.role] >= roleHierarchy[requiredRole];
  };

  /**
   * Check if user has any of the specified roles
   * @param {string[]} roles - Array of acceptable roles
   * @returns {boolean} - True if user has any of the specified roles
   */
  const hasAnyRole = (roles) => {
    if (!profile?.role) return false;
    return roles.includes(profile.role);
  };

  /**
   * Check if user has exact role match
   * @param {string} role - The exact role to check
   * @returns {boolean} - True if user has exact role
   */
  const hasExactRole = (role) => {
    return profile?.role === role;
  };

  // Convenience methods for common permission checks
  const canAccessAdminFeatures = () => hasRole('admin');
  const canManageEvents = () => hasRole('committee_lead');
  const canManageBudget = () => hasRole('committee_lead');
  const canManageCommunications = () => hasRole('committee_lead');
  const canManageUsers = () => hasRole('admin');
  const canViewReports = () => hasRole('board_member');
  const canCreateEvents = () => hasRole('volunteer');
  const canVolunteer = () => hasRole('parent_member');

  // Organization-specific permissions
  const isInOrganization = () => !!profile?.org_id && !!organization;
  const getOrganizationId = () => profile?.org_id;
  const getOrganizationName = () => organization?.name;

  // Role display helpers
  const getRoleDisplayName = (role = profile?.role) => {
    const roleNames = {
      'admin': 'Administrator',
      'board_member': 'Board Member',
      'committee_lead': 'Committee Lead',
      'volunteer': 'Volunteer',
      'parent_member': 'Parent Member',
      'teacher': 'Teacher'
    };
    return roleNames[role] || 'Unknown Role';
  };

  const getRoleColor = (role = profile?.role) => {
    const roleColors = {
      'admin': 'bg-red-100 text-red-800',
      'board_member': 'bg-purple-100 text-purple-800',
      'committee_lead': 'bg-blue-100 text-blue-800',
      'volunteer': 'bg-green-100 text-green-800',
      'parent_member': 'bg-yellow-100 text-yellow-800',
      'teacher': 'bg-indigo-100 text-indigo-800'
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };

  // Navigation permissions
  const canAccessRoute = (route) => {
    const routePermissions = {
      '/dashboard/admin': canAccessAdminFeatures(),
      '/dashboard/board': hasRole('board_member'),
      '/dashboard/committee': hasRole('committee_lead'),
      '/dashboard/volunteer': hasRole('volunteer'),
      '/dashboard/parent': hasRole('parent_member'),
      '/dashboard/teacher': hasExactRole('teacher'),
      '/events': canManageEvents(),
      '/budget': canManageBudget(),
      '/communications': canManageCommunications(),
      '/billing': canAccessAdminFeatures(),
      '/shared-library': hasRole('volunteer'),
      '/teacher-requests': hasExactRole('teacher')
    };

    return routePermissions[route] ?? false;
  };

  return {
    // Core permission checking
    hasRole,
    hasAnyRole,
    hasExactRole,
    
    // Convenience methods
    canAccessAdminFeatures,
    canManageEvents,
    canManageBudget,
    canManageCommunications,
    canManageUsers,
    canViewReports,
    canCreateEvents,
    canVolunteer,
    
    // Organization context
    isInOrganization,
    getOrganizationId,
    getOrganizationName,
    
    // Display helpers
    getRoleDisplayName,
    getRoleColor,
    
    // Navigation
    canAccessRoute,
    
    // Current user context
    currentRole: profile?.role,
    currentUserId: profile?.id,
    loading
  };
}
