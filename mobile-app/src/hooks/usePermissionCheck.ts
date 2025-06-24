import { useCallback, useMemo } from 'react';
import useAuthStore from '../store/auth.store';

/**
 * Custom hook for checking user permissions
 * 
 * @returns {Object} Permission checking utilities
 */
export const usePermissionCheck = () => {
  const { permissions, role, user } = useAuthStore();

  /**
   * Check if the user has a specific permission
   * 
   * @param {string} permissionName - The permission to check for
   * @returns {boolean} Whether the user has the permission
   */
  const hasPermission = useCallback(
    (permissionName: string): boolean => {
      if (!user || !permissions) return false;
      return permissions.includes(permissionName);
    },
    [user, permissions]
  );

  /**
   * Check if the user has any of the specified permissions
   * 
   * @param {string[]} permissionNames - The permissions to check for
   * @returns {boolean} Whether the user has any of the permissions
   */
  const hasAnyPermission = useCallback(
    (permissionNames: string[]): boolean => {
      if (!user || !permissions) return false;
      return permissionNames.some(permission => permissions.includes(permission));
    },
    [user, permissions]
  );

  /**
   * Check if the user has all of the specified permissions
   * 
   * @param {string[]} permissionNames - The permissions to check for
   * @returns {boolean} Whether the user has all of the permissions
   */
  const hasAllPermissions = useCallback(
    (permissionNames: string[]): boolean => {
      if (!user || !permissions) return false;
      return permissionNames.every(permission => permissions.includes(permission));
    },
    [user, permissions]
  );

  /**
   * Check if the user has a specific role
   * 
   * @param {string} roleName - The role to check for
   * @returns {boolean} Whether the user has the role
   */
  const hasRole = useCallback(
    (roleName: string): boolean => {
      if (!user || !role) return false;
      return role === roleName;
    },
    [user, role]
  );

  /**
   * Get all permissions for the current user
   * 
   * @returns {string[]} Array of permission strings
   */
  const getAllPermissions = useMemo(() => permissions || [], [permissions]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    getAllPermissions,
    isAuthenticated: !!user,
    userRole: role,
  };
}; 