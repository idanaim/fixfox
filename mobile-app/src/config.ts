import { getEnvironmentConfig, getApiBaseUrl, logEnvironmentConfig } from './config/environment';

// Get environment configuration
const envConfig = getEnvironmentConfig();

// Export the main API configuration
export const API_BASE_URL = getApiBaseUrl();

// Export individual URLs for backward compatibility
export const LOCAL_API = envConfig.localApiUrl;
export const DEPLOYED_API = envConfig.deployedApiUrl;

// Export environment configuration for use in components
export const {
  apiEnv,
  useLocalAPI,
  debugApi,
  isDevelopment
} = envConfig;

// Log current configuration
logEnvironmentConfig();
