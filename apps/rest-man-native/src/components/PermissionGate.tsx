import React from 'react';
import { usePermissionCheck } from '../hooks/usePermissionCheck';

interface PermissionGateProps {
  /**
   * A single permission string to check for
   */
  permission?: string;
  
  /**
   * An array of permissions where any one is sufficient
   */
  anyPermissions?: string[];
  
  /**
   * An array of permissions where all are required
   */
  allPermissions?: string[];
  
  /**
   * A specific role to check for
   */
  role?: string;
  
  /**
   * Content to render when permission check passes
   */
  children: React.ReactNode;
  
  /**
   * Optional content to render when permission check fails
   */
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders content based on user permissions
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  anyPermissions,
  allPermissions,
  role,
  children,
  fallback = null,
}) => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    hasRole,
    isAuthenticated 
  } = usePermissionCheck();

  // If no permission criteria provided, just check authentication
  if (!permission && !anyPermissions && !allPermissions && !role) {
    return isAuthenticated ? <>{children}</> : <>{fallback}</>;
  }

  // Check for specific permission
  if (permission && hasPermission(permission)) {
    return <>{children}</>;
  }

  // Check for any of the permissions
  if (anyPermissions && hasAnyPermission(anyPermissions)) {
    return <>{children}</>;
  }

  // Check for all permissions
  if (allPermissions && hasAllPermissions(allPermissions)) {
    return <>{children}</>;
  }

  // Check for role
  if (role && hasRole(role)) {
    return <>{children}</>;
  }

  // If all checks fail, render fallback
  return <>{fallback}</>;
}; 