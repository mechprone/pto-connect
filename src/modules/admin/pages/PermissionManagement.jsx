import React, { useState, useEffect } from 'react';
import { useAdminPermissions } from '@/modules/hooks/useAdminPermissions';
import { useRoleAccess } from '@/modules/hooks/useRoleAccess';
import PermissionGate from '@/components/common/PermissionGate';

/**
 * Permission Management Dashboard
 * Main interface for admins to customize organization permissions
 */
export default function PermissionManagement() {
  const { canAccessAdminFeatures } = useRoleAccess();
  const {
    templates,
    orgPermissions,
    loading,
    error,
    saving,
    isAdmin,
    updatePermission,
    bulkUpdatePermissions,
    resetPermission,
    getPermissionsByModule,
    getEffectivePermission,
    isPermissionCustomized,
    refreshPermissions
  } = useAdminPermissions();

  const [selectedModule, setSelectedModule] = useState('all');
  const [pendingChanges, setPendingChanges] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);

  // Available roles for permission assignment
  const roles = [
    { value: 'volunteer', label: 'Volunteer', color: 'bg-green-100 text-green-800' },
    { value: 'committee_lead', label: 'Committee Lead', color: 'bg-blue-100 text-blue-800' },
    { value: 'board_member', label: 'Board Member', color: 'bg-purple-100 text-purple-800' },
    { value: 'admin', label: 'Administrator', color: 'bg-red-100 text-red-800' }
  ];

  // Get unique modules from templates
  const modules = [...new Set(templates.map(t => t.module_name))].sort();

  // Filter templates by selected module
  const filteredTemplates = selectedModule === 'all' 
    ? templates 
    : templates.filter(t => t.module_name === selectedModule);

  // Group templates by module for display
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const module = template.module_name;
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(template);
    return acc;
  }, {});

  // Handle permission change
  const handlePermissionChange = (permissionKey, field, value) => {
    setPendingChanges(prev => ({
      ...prev,
      [permissionKey]: {
        ...prev[permissionKey],
        [field]: value
      }
    }));
  };

  // Save individual permission
  const savePermission = async (permissionKey) => {
    const changes = pendingChanges[permissionKey];
    if (!changes) return;

    try {
      const currentPermission = getEffectivePermission(permissionKey);
      const updatedSettings = {
        min_role_required: changes.min_role_required || currentPermission.current_min_role,
        specific_users: changes.specific_users || currentPermission.specific_users,
        is_enabled: changes.is_enabled !== undefined ? changes.is_enabled : currentPermission.is_enabled
      };

      await updatePermission(permissionKey, updatedSettings);
      
      // Remove from pending changes
      setPendingChanges(prev => {
        const updated = { ...prev };
        delete updated[permissionKey];
        return updated;
      });

      // Show success message
      alert(`Permission "${permissionKey}" updated successfully!`);
    } catch (err) {
      alert(`Failed to update permission: ${err.message}`);
    }
  };

  // Save all pending changes
  const saveAllChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) return;

    try {
      const permissionsToUpdate = Object.entries(pendingChanges).map(([permissionKey, changes]) => {
        const currentPermission = getEffectivePermission(permissionKey);
        return {
          permission_key: permissionKey,
          min_role_required: changes.min_role_required || currentPermission.current_min_role,
          specific_users: changes.specific_users || currentPermission.specific_users,
          is_enabled: changes.is_enabled !== undefined ? changes.is_enabled : currentPermission.is_enabled
        };
      });

      await bulkUpdatePermissions(permissionsToUpdate);
      setPendingChanges({});
      alert(`Successfully updated ${permissionsToUpdate.length} permissions!`);
    } catch (err) {
      alert(`Failed to save changes: ${err.message}`);
    }
  };

  // Reset permission to default
  const handleResetPermission = async (permissionKey) => {
    if (!confirm(`Reset "${permissionKey}" to default settings?`)) return;

    try {
      await resetPermission(permissionKey);
      
      // Remove from pending changes
      setPendingChanges(prev => {
        const updated = { ...prev };
        delete updated[permissionKey];
        return updated;
      });

      alert(`Permission "${permissionKey}" reset to default!`);
    } catch (err) {
      alert(`Failed to reset permission: ${err.message}`);
    }
  };

  // Get effective permission with pending changes
  const getDisplayPermission = (permissionKey) => {
    const effective = getEffectivePermission(permissionKey);
    const pending = pendingChanges[permissionKey];
    
    if (!pending) return effective;

    return {
      ...effective,
      current_min_role: pending.min_role_required || effective.current_min_role,
      specific_users: pending.specific_users || effective.specific_users,
      is_enabled: pending.is_enabled !== undefined ? pending.is_enabled : effective.is_enabled
    };
  };

  // Check if user is admin
  if (!canAccessAdminFeatures || !isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">Only administrators can access permission management.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Permissions</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refreshPermissions}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Permission Management</h1>
        <p className="text-gray-600">
          Customize which roles can perform specific actions in your organization.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Module Filter */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Module:</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Modules</option>
              {modules.map(module => (
                <option key={module} value={module}>
                  {module.charAt(0).toUpperCase() + module.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBulkMode(!bulkMode)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                bulkMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {bulkMode ? 'Exit Bulk Mode' : 'Bulk Edit'}
            </button>
            
            {Object.keys(pendingChanges).length > 0 && (
              <>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium hover:bg-yellow-200"
                >
                  Preview Changes ({Object.keys(pendingChanges).length})
                </button>
                <button
                  onClick={saveAllChanges}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save All Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && Object.keys(pendingChanges).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Pending Changes</h3>
          <div className="space-y-2">
            {Object.entries(pendingChanges).map(([permissionKey, changes]) => (
              <div key={permissionKey} className="text-sm text-yellow-700">
                <span className="font-medium">{permissionKey}:</span>
                {changes.min_role_required && (
                  <span className="ml-2">Role → {changes.min_role_required}</span>
                )}
                {changes.is_enabled !== undefined && (
                  <span className="ml-2">Enabled → {changes.is_enabled ? 'Yes' : 'No'}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permission Grid */}
      <div className="space-y-8">
        {Object.entries(groupedTemplates).map(([moduleName, moduleTemplates]) => (
          <div key={moduleName} className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Module Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {moduleName.replace('_', ' ')} Module
                </h2>
                <span className="text-sm text-gray-500">
                  {moduleTemplates.length} permissions
                </span>
              </div>
            </div>

            {/* Permission Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Minimum Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {moduleTemplates.map(template => {
                    const permission = getDisplayPermission(template.permission_key);
                    const hasChanges = pendingChanges[template.permission_key];
                    const isCustomized = isPermissionCustomized(template.permission_key);

                    return (
                      <tr key={template.permission_key} className={hasChanges ? 'bg-yellow-50' : ''}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {permission.permission_name}
                              {isCustomized && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Custom
                                </span>
                              )}
                              {hasChanges && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Modified
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {permission.permission_description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={permission.current_min_role}
                            onChange={(e) => handlePermissionChange(
                              template.permission_key, 
                              'min_role_required', 
                              e.target.value
                            )}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                          >
                            {roles.map(role => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={permission.is_enabled}
                              onChange={(e) => handlePermissionChange(
                                template.permission_key,
                                'is_enabled',
                                e.target.checked
                              )}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {permission.is_enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </label>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {hasChanges && (
                              <button
                                onClick={() => savePermission(template.permission_key)}
                                disabled={saving}
                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                              >
                                Save
                              </button>
                            )}
                            {isCustomized && (
                              <button
                                onClick={() => handleResetPermission(template.permission_key)}
                                disabled={saving}
                                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Help Text */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Permission Management Guide</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Minimum Role:</strong> The lowest role level that can perform this action</li>
          <li>• <strong>Custom:</strong> Permission has been modified from the default setting</li>
          <li>• <strong>Modified:</strong> Permission has unsaved changes</li>
          <li>• <strong>Reset:</strong> Restore permission to its default setting</li>
          <li>• Changes take effect immediately for all users in your organization</li>
        </ul>
      </div>
    </div>
  );
}
