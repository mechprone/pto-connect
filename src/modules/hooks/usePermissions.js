import { useState, useEffect, useCallback } from 'react';
import { useUserProfile } from './useUserProfile';
import { supabase } from '@/utils/supabaseClient';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Core permission checking hook for permission-aware UI
 * Integrates with the flexible permission system implemented in Sprint 2
 */
export function usePermissions() {
  const { profile, loading: profileLoading } = useUserProfile();
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's permissions from the backend
  const fetchPermissions = useCallback(async () => {
    if (!profile?.user_id || profileLoading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      // Get all permission templates to check against
      const templatesResponse = await axios.get(`${API_BASE_URL}/api/admin/organization-permissions/templates`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      const templates = templatesResponse.data.templates || [];
      const userPermissions = {};

      // Check each permission for the current user
      for (const template of templates) {
        try {
          // Use the database function to check organization-specific permissions
          const { data: hasPermission, error: permError } = await supabase
            .rpc('user_has_org_permission', {
              user_id_param: profile.user_id,
              permission_key_param: template.permission_key
            });

          if (!permError) {
            userPermissions[template.permission_key] = hasPermission;
          } else {
            console.warn(`Error checking permission ${template.permission_key}:`, permError.message);
            userPermissions[template.permission_key] = false;
          }
        } catch (err) {
          console.warn(`Failed to check permission ${template.permission_key}:`, err.message);
          userPermissions[template.permission_key] = false;
        }
      }

      setPermissions(userPermissions);
    } catch (err) {
      console.error('Error fetching user permissions:', err.message);
      setError(err.message);
      setPermissions({});
    } finally {
      setLoading(false);
    }
  }, [profile?.user_id, profileLoading]);

  // Fetch permissions when profile is available
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  /**
   * Check if user has a specific permission
   * @param {string} permissionKey - The permission key to check
   * @returns {boolean} - True if user has the permission
   */
  const hasPermission = useCallback((permissionKey) => {
    if (loading || !permissionKey) return false;
    return permissions[permissionKey] || false;
  }, [permissions, loading]);

  /**
   * Check if user has any of the specified permissions
   * @param {string[]} permissionKeys - Array of permission keys to check
   * @returns {boolean} - True if user has any of the permissions
   */
  const hasAnyPermission = useCallback((permissionKeys) => {
    if (!Array.isArray(permissionKeys) || loading) return false;
    return permissionKeys.some(key => hasPermission(key));
  }, [hasPermission, loading]);

  /**
   * Check if user has all of the specified permissions
   * @param {string[]} permissionKeys - Array of permission keys to check
   * @returns {boolean} - True if user has all of the permissions
   */
  const hasAllPermissions = useCallback((permissionKeys) => {
    if (!Array.isArray(permissionKeys) || loading) return false;
    return permissionKeys.every(key => hasPermission(key));
  }, [hasPermission, loading]);

  /**
   * Get permissions grouped by module
   * @returns {Object} - Permissions organized by module name
   */
  const getPermissionsByModule = useCallback(() => {
    const grouped = {};
    
    Object.keys(permissions).forEach(permissionKey => {
      // Extract module name from permission key (e.g., 'can_view_events' -> 'events')
      const parts = permissionKey.split('_');
      if (parts.length >= 3) {
        const moduleName = parts.slice(2).join('_'); // Handle multi-word modules
        if (!grouped[moduleName]) {
          grouped[moduleName] = {};
        }
        grouped[moduleName][permissionKey] = permissions[permissionKey];
      }
    });

    return grouped;
  }, [permissions]);

  /**
   * Check if user can access a specific module
   * @param {string} moduleName - The module name to check
   * @returns {boolean} - True if user has any permissions in the module
   */
  const canAccessModule = useCallback((moduleName) => {
    const modulePermissions = getPermissionsByModule()[moduleName] || {};
    return Object.values(modulePermissions).some(hasPermission => hasPermission);
  }, [getPermissionsByModule]);

  /**
   * Refresh permissions (useful after role changes)
   */
  const refreshPermissions = useCallback(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Convenience methods for common permission checks
  const canViewMessages = hasPermission('can_view_messages');
  const canCreateMessages = hasPermission('can_create_messages');
  const canSendEmails = hasPermission('can_send_emails');
  
  const canViewBudget = hasPermission('can_view_budget');
  const canCreateBudgetItems = hasPermission('can_create_budget_items');
  const canApproveExpenses = hasPermission('can_approve_expenses');
  
  const canViewEvents = hasPermission('can_view_events');
  const canCreateEvents = hasPermission('can_create_events');
  const canManageVolunteers = hasPermission('can_manage_volunteers');
  
  const canViewFundraisers = hasPermission('can_view_fundraisers');
  const canCreateFundraisers = hasPermission('can_create_fundraisers');
  
  const canViewDocuments = hasPermission('can_view_documents');
  const canUploadDocuments = hasPermission('can_upload_documents');
  
  const canViewRequests = hasPermission('can_view_requests');
  const canCreateRequests = hasPermission('can_create_requests');
  
  const canViewUsers = hasPermission('can_view_users');
  const canEditUserRoles = hasPermission('can_edit_user_roles');
  const canInviteUsers = hasPermission('can_invite_users');

  return {
    // Core permission checking
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Module-based checking
    getPermissionsByModule,
    canAccessModule,
    
    // Convenience methods for common permissions
    canViewMessages,
    canCreateMessages,
    canSendEmails,
    canViewBudget,
    canCreateBudgetItems,
    canApproveExpenses,
    canViewEvents,
    canCreateEvents,
    canManageVolunteers,
    canViewFundraisers,
    canCreateFundraisers,
    canViewDocuments,
    canUploadDocuments,
    canViewRequests,
    canCreateRequests,
    canViewUsers,
    canEditUserRoles,
    canInviteUsers,
    
    // State management
    loading,
    error,
    refreshPermissions,
    
    // User context
    userId: profile?.user_id,
    orgId: profile?.org_id,
    userRole: profile?.role
  };
}
