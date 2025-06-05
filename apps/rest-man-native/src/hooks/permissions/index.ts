export { usePermissionCheck } from '../usePermissionCheck';
export { usePermissionNavigation } from '../usePermissionNavigation';
export { PermissionGate } from '../../components/PermissionGate';

// Common permission constants
export const PERMISSIONS = {
  // User management
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  
  // Equipment management
  CREATE_EQUIPMENT: 'create_equipment',
  READ_EQUIPMENT: 'read_equipment',
  UPDATE_EQUIPMENT: 'update_equipment',
  DELETE_EQUIPMENT: 'delete_equipment',
  
  // Issue management
  CREATE_ISSUE: 'create_issue',
  READ_ISSUE: 'read_issue',
  UPDATE_ISSUE: 'update_issue',
  DELETE_ISSUE: 'delete_issue',
  ASSIGN_ISSUE: 'assign_issue',
  
  // Admin permissions
  ACCESS_ADMIN: 'access_admin',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_PERMISSIONS: 'manage_permissions',
  
  // Business management
  CREATE_BUSINESS: 'create_business',
  READ_BUSINESS: 'read_business',
  UPDATE_BUSINESS: 'update_business',
  DELETE_BUSINESS: 'delete_business',
};

// Common role constants
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  TECHNICIAN: 'technician',
  USER: 'user',
}; 