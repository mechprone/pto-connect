import { useState, useEffect, useCallback } from 'react';
import { useUserProfile } from './useUserProfile';
import { supabase } from '@/utils/supabaseClient';
import axios from 'axios';

/**
 * Admin permission management hook
 * Provides functionality for admins to manage organization permissions
 */
export function useAdminPermissions() {
  const { profile, loading: profileLoading } = useUserProfile();
  const [templates, setTemplates] = useState([]);
  const [orgPermissions, setOrgPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Check if current user is admin
  const isAdmin = profile?.role === 'admin';

  // Fetch permission templates and organization settings
  const fetchPermissionData = useCallback(async () => {
    if (!profile?.user_id || profileLoading || !isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      // Fetch permission templates and organization permissions in parallel
      const [templatesResponse, orgPermissionsResponse] = await Promise.all([
        axios.get('/api/admin/organization-permissions/templates', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }),
        axios.get('/api/admin/organization-permissions', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
      ]);

      setTemplates(templatesResponse.data.templates || []);
      setOrgPermissions(orgPermissionsResponse.data.permissions || []);
    } catch (err) {
      console.error('Error fetching permission data:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profile?.user_id, profileLoading, isAdmin]);

  // Fetch data when profile is available
  useEffect(() => {
    fetchPermissionData();
  }, [fetchPermissionData]);

  /**
   * Update a specific permission setting
   * @param {string} permissionKey - The permission key to update
   * @param {Object} settings - The new permission settings
   * @returns {Promise<Object>} - The updated permission data
   */
  const updatePermission = useCallback(async (permissionKey, settings) => {
    if (!isAdmin) {
      throw new Error('Only administrators can modify permissions');
    }

    try {
      setSaving(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.put(
        `/api/admin/organization-permissions/${permissionKey}`,
        settings,
        {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }
      );

      // Refresh permission data to reflect changes
      await fetchPermissionData();

      return response.data;
    } catch (err) {
      console.error(`Error updating permission ${permissionKey}:`, err.message);
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [isAdmin, fetchPermissionData]);

  /**
   * Bulk update multiple permissions
   * @param {Array} permissions - Array of permission objects to update
   * @returns {Promise<Object>} - The bulk update result
   */
  const bulkUpdatePermissions = useCallback(async (permissions) => {
    if (!isAdmin) {
      throw new Error('Only administrators can modify permissions');
    }

    try {
      setSaving(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        '/api/admin/organization-permissions/bulk-update',
        { permissions },
        {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }
      );

      // Refresh permission data to reflect changes
      await fetchPermissionData();

      return response.data;
    } catch (err) {
      console.error('Error bulk updating permissions:', err.message);
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [isAdmin, fetchPermissionData]);

  /**
   * Reset a permission to its default setting
   * @param {string} permissionKey - The permission key to reset
   * @returns {Promise<Object>} - The reset result
   */
  const resetPermission = useCallback(async (permissionKey) => {
    if (!isAdmin) {
      throw new Error('Only administrators can modify permissions');
    }

    try {
      setSaving(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.delete(
        `/api/admin/organization-permissions/${permissionKey}`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }
      );

      // Refresh permission data to reflect changes
      await fetchPermissionData();

      return response.data;
    } catch (err) {
      console.error(`Error resetting permission ${permissionKey}:`, err.message);
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [isAdmin, fetchPermissionData]);

  /**
   * Get user-specific permissions for audit purposes
   * @param {string} userId - The user ID to check permissions for
   * @returns {Promise<Object>} - The user's permission data
   */
  const getUserPermissions = useCallback(async (userId) => {
    if (!isAdmin) {
      throw new Error('Only administrators can view user permissions');
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `/api/admin/organization-permissions/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }
      );

      return response.data;
    } catch (err) {
      console.error(`Error fetching permissions for user ${userId}:`, err.message);
      throw err;
    }
  }, [isAdmin]);

  /**
   * Get permissions grouped by module for easier management
   * @returns {Object} - Permissions organized by module
   */
  const getPermissionsByModule = useCallback(() => {
    const grouped = {};
    
    orgPermissions.forEach(permission => {
      const moduleName = permission.module_name;
      if (!grouped[moduleName]) {
        grouped[moduleName] = [];
      }
      grouped[moduleName].push(permission);
    });

    return grouped;
  }, [orgPermissions]);

  /**
   * Get template for a specific permission
   * @param {string} permissionKey - The permission key
   * @returns {Object|null} - The permission template
   */
  const getPermissionTemplate = useCallback((permissionKey) => {
    return templates.find(template => template.permission_key === permissionKey) || null;
  }, [templates]);

  /**
   * Check if a permission has been customized from its default
   * @param {string} permissionKey - The permission key
   * @returns {boolean} - True if permission has custom settings
   */
  const isPermissionCustomized = useCallback((permissionKey) => {
    const orgPermission = orgPermissions.find(p => p.permission_key === permissionKey);
    return !!orgPermission?.has_custom_setting;
  }, [orgPermissions]);

  /**
   * Get effective permission settings (custom or default)
   * @param {string} permissionKey - The permission key
   * @returns {Object} - The effective permission settings
   */
  const getEffectivePermission = useCallback((permissionKey) => {
    const orgPermission = orgPermissions.find(p => p.permission_key === permissionKey);
    const template = getPermissionTemplate(permissionKey);
    
    if (!template) return null;

    return {
      permission_key: permissionKey,
      module_name: template.module_name,
      permission_name: template.permission_name,
      permission_description: template.permission_description,
      current_min_role: orgPermission?.current_min_role || template.default_min_role,
      specific_users: orgPermission?.specific_users || [],
      is_enabled: orgPermission?.is_enabled !== undefined ? orgPermission.is_enabled : true,
      is_customized: !!orgPermission?.has_custom_setting,
      default_min_role: template.default_min_role
    };
  }, [orgPermissions, getPermissionTemplate]);

  /**
   * Refresh permission data
   */
  const refreshPermissions = useCallback(() => {
    fetchPermissionData();
  }, [fetchPermissionData]);

  return {
    // Data
    templates,
    orgPermissions,
    
    // State
    loading,
    error,
    saving,
    isAdmin,
    
    // Actions
    updatePermission,
    bulkUpdatePermissions,
    resetPermission,
    getUserPermissions,
    refreshPermissions,
    
    // Utilities
    getPermissionsByModule,
    getPermissionTemplate,
    isPermissionCustomized,
    getEffectivePermission,
    
    // User context
    userId: profile?.user_id,
    orgId: profile?.org_id,
    userRole: profile?.role
  };
}
