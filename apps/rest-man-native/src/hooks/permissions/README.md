# Permissions System

This module provides a comprehensive permissions system for controlling UI access and actions based on user permissions and roles.

## Core Components

### 1. usePermissionCheck Hook

This hook provides utilities for checking user permissions and roles.

```typescript
import { usePermissionCheck } from '../hooks/permissions';

const MyComponent = () => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    hasRole,
    getAllPermissions,
    isAuthenticated,
    userRole
  } = usePermissionCheck();

  // Check a single permission
  if (hasPermission('create_issue')) {
    // User can create issues
  }

  // Check if user has any of these permissions
  if (hasAnyPermission(['update_issue', 'delete_issue'])) {
    // User can either update or delete issues
  }

  // Check if user has all of these permissions
  if (hasAllPermissions(['create_issue', 'assign_issue'])) {
    // User can both create and assign issues
  }

  // Check user role
  if (hasRole('admin')) {
    // User is an admin
  }

  return (
    // Your component JSX
  );
};
```

### 2. PermissionGate Component

This component conditionally renders content based on user permissions.

```typescript
import { PermissionGate, PERMISSIONS } from '../hooks/permissions';

const Dashboard = () => {
  return (
    <View>
      <Text>Dashboard</Text>
      
      {/* Only render if user has a specific permission */}
      <PermissionGate permission={PERMISSIONS.CREATE_ISSUE}>
        <Button title="Create New Issue" onPress={handleCreateIssue} />
      </PermissionGate>
      
      {/* Only render if user has any of these permissions */}
      <PermissionGate anyPermissions={[PERMISSIONS.UPDATE_ISSUE, PERMISSIONS.DELETE_ISSUE]}>
        <IssueManagementPanel />
      </PermissionGate>
      
      {/* Only render if user has all these permissions */}
      <PermissionGate allPermissions={[PERMISSIONS.READ_USER, PERMISSIONS.UPDATE_USER]}>
        <UserManagementPanel />
      </PermissionGate>
      
      {/* Only render if user has a specific role */}
      <PermissionGate role="admin">
        <AdminPanel />
      </PermissionGate>
      
      {/* Show alternative content if permission check fails */}
      <PermissionGate 
        permission={PERMISSIONS.ACCESS_ADMIN} 
        fallback={<Text>You need admin access to view this content</Text>}
      >
        <AdminDashboard />
      </PermissionGate>
    </View>
  );
};
```

### 3. usePermissionNavigation Hook

This hook provides utilities for permission-based navigation.

```typescript
import { usePermissionNavigation, PERMISSIONS } from '../hooks/permissions';

const NavigationButtons = () => {
  const { navigateWithPermission, navigateWithRole, canNavigate } = usePermissionNavigation();
  
  const handleAdminPress = () => {
    // Only navigate if user has admin access permission
    navigateWithPermission(
      'AdminScreen', 
      { id: 123 },
      PERMISSIONS.ACCESS_ADMIN,
      'You need admin privileges to access this area'
    );
  };
  
  const handleManagerPress = () => {
    // Only navigate if user has manager role
    navigateWithRole(
      'ManagerDashboard', 
      {},
      'manager',
      'Only managers can access this dashboard'
    );
  };
  
  return (
    <View>
      {/* Only show button if user can navigate to this screen */}
      {canNavigate(PERMISSIONS.UPDATE_USER) && (
        <Button title="User Management" onPress={() => navigation.navigate('UserManagement')} />
      )}
      
      <Button title="Admin Area" onPress={handleAdminPress} />
      <Button title="Manager Dashboard" onPress={handleManagerPress} />
    </View>
  );
};
```

## Updating Auth Store

The permissions system works with the `authStore`, which has been updated to store permissions and role information. Make sure to update the login handler to store permissions:

```typescript
// Login handler
const handleLogin = async (credentials) => {
  const response = await loginMutation.mutateAsync(credentials);
  const { access_token, user, permissions, role } = response;
  
  // Store user data with permissions
  useAuthStore.getState().signIn(access_token, user, permissions, role);
};
```

## Permission Constants

For consistency, use the predefined permission constants when checking permissions:

```typescript
import { PERMISSIONS, ROLES } from '../hooks/permissions';

// Using permission constants
<PermissionGate permission={PERMISSIONS.CREATE_ISSUE}>
  <CreateIssueButton />
</PermissionGate>

// Using role constants
<PermissionGate role={ROLES.ADMIN}>
  <AdminPanel />
</PermissionGate>
``` 