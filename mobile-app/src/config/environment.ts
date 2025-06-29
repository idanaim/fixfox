// Environment configuration types and utilities

export type ApiEnvironment = 'local' | 'staging' | 'production';

export interface EnvironmentConfig {
  apiEnv: ApiEnvironment;
  useLocalAPI: boolean;
  localApiUrl: string;
  deployedApiUrl: string;
  debugApi: boolean;
  isDevelopment: boolean;
}

/**
 * Get the current API environment from environment variables
 */
export function getApiEnvironment(): ApiEnvironment {
  const env = process.env.EXPO_PUBLIC_API_ENV;

  if (env === 'production' || env === 'staging' || env === 'local') {
    return env;
  }

  // Default to local in development, production otherwise
  return __DEV__ ? 'local' : 'production';
}

/**
 * Determine if local API should be used based on environment configuration
 */
export function shouldUseLocalAPI(): boolean {
  // Explicit override via environment variable
  if (process.env.EXPO_PUBLIC_USE_LOCAL_API === 'true') {
    return true;
  }

  if (process.env.EXPO_PUBLIC_USE_LOCAL_API === 'false') {
    return false;
  }

  // Check API environment setting
  const apiEnv = getApiEnvironment();
  if (apiEnv === 'local') {
    return true;
  }

  // Default to local API in development mode when no explicit setting
  return __DEV__ && !process.env.EXPO_PUBLIC_API_ENV;
}

/**
 * Get the complete environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const apiEnv = getApiEnvironment();
  const useLocalAPI = shouldUseLocalAPI();

  return {
    apiEnv,
    useLocalAPI,
    localApiUrl: process.env.EXPO_PUBLIC_LOCAL_API_URL || 'http://localhost:3000/api',//for android studio: 'http://10.0.2.2:3000/api',
    deployedApiUrl: process.env.EXPO_PUBLIC_DEPLOYED_API_URL || 'http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api',
    debugApi: process.env.EXPO_PUBLIC_DEBUG_API === 'true' || __DEV__,
    isDevelopment: __DEV__
  };
}

/**
 * Get the current API base URL based on environment configuration
 */
export function getApiBaseUrl(): string {
  const config = getEnvironmentConfig();
  return config.useLocalAPI ? config.localApiUrl : config.deployedApiUrl;
}

/**
 * Log environment configuration for debugging
 */
export function logEnvironmentConfig(): void {
  const config = getEnvironmentConfig();

  console.log('🚀 Environment Configuration:', {
    ...config,
    currentApiUrl: getApiBaseUrl(),
    envVars: {
      EXPO_PUBLIC_API_ENV: process.env.EXPO_PUBLIC_API_ENV,
      EXPO_PUBLIC_USE_LOCAL_API: process.env.EXPO_PUBLIC_USE_LOCAL_API,
      EXPO_PUBLIC_LOCAL_API_URL: process.env.EXPO_PUBLIC_LOCAL_API_URL,
      EXPO_PUBLIC_DEPLOYED_API_URL: process.env.EXPO_PUBLIC_DEPLOYED_API_URL,
      EXPO_PUBLIC_DEBUG_API: process.env.EXPO_PUBLIC_DEBUG_API,
      __DEV__: __DEV__
    }
  });
}
