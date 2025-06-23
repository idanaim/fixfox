import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { usePermissionCheck } from './usePermissionCheck';

/**
 * Custom hook for permission-based navigation
 *
 * @returns {Object} Permission-based navigation utilities
 */
export const usePermissionNavigation = () => {
  const navigation = useNavigation();
  const { hasPermission, hasRole } = usePermissionCheck();

  /**
   * Navigate to a screen if user has the required permission
   *
   * @param {string} screenName - The screen to navigate to
   * @param {object} params - Navigation params
   * @param {string} requiredPermission - Permission required to navigate
   * @param {string} errorMessage - Optional error message to show if permission check fails
   * @returns {boolean} Whether navigation was successful
   */
  const navigateWithPermission = useCallback(
    (
      screenName: string,
      params: object = {},
      requiredPermission: string,
      errorMessage = 'You do not have permission to access this screen.'
    ): boolean => {
      if (hasPermission(requiredPermission)) {
        // @ts-ignore
        navigation.navigate(screenName as never, params as never);
        return true;
      } else {
        Alert.alert('Permission Denied', errorMessage);
        return false;
      }
    },
    [navigation, hasPermission]
  );

  /**
   * Navigate to a screen if user has the required role
   *
   * @param {string} screenName - The screen to navigate to
   * @param {object} params - Navigation params
   * @param {string} requiredRole - Role required to navigate
   * @param {string} errorMessage - Optional error message to show if role check fails
   * @returns {boolean} Whether navigation was successful
   */
  const navigateWithRole = useCallback(
    (
      screenName: string,
      params: object = {},
      requiredRole: string,
      errorMessage = 'Your role does not allow access to this screen.'
    ): boolean => {
      if (hasRole(requiredRole)) {
        // @ts-ignore
        navigation.navigate(screenName as never, params as never);
        return true;
      } else {
        Alert.alert('Access Denied', errorMessage);
        return false;
      }
    },
    [navigation, hasRole]
  );

  /**
   * Check if navigation to a screen is allowed based on permission
   *
   * @param {string} requiredPermission - Permission required to navigate
   * @returns {boolean} Whether navigation is allowed
   */
  const canNavigate = useCallback(
    (requiredPermission: string): boolean => {
      return hasPermission(requiredPermission);
    },
    [hasPermission]
  );

  return {
    navigateWithPermission,
    navigateWithRole,
    canNavigate,
  };
};
