// Environment Configuration for FixFox React Native App

export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  ENVIRONMENT: Environment;
  DEBUG: boolean;
  APP_NAME: string;
  VERSION: string;
}

// Environment configurations
const environments: Record<Environment, EnvironmentConfig> = {
  development: {
    API_BASE_URL: 'http://localhost:3000/api',
    API_TIMEOUT: 10000,
    ENVIRONMENT: 'development',
    DEBUG: true,
    APP_NAME: 'FixFox Dev',
    VERSION: '1.0.0-dev',
  },
  staging: {
    API_BASE_URL: 'https://YOUR_DEV_APP_RUNNER_URL/api', // Will be updated after deployment
    API_TIMEOUT: 15000,
    ENVIRONMENT: 'staging',
    DEBUG: true,
    APP_NAME: 'FixFox Staging',
    VERSION: '1.0.0-staging',
  },
  production: {
    API_BASE_URL: 'https://YOUR_PROD_APP_RUNNER_URL/api', // Will be updated after deployment
    API_TIMEOUT: 15000,
    ENVIRONMENT: 'production',
    DEBUG: false,
    APP_NAME: 'FixFox',
    VERSION: '1.0.0',
  },
};

// Determine current environment
const getCurrentEnvironment = (): Environment => {
  // Check if we're in Expo development mode
  if (__DEV__) {
    return 'development';
  }

  // Check for environment variables (for EAS builds)
  const envFromBuild = process.env.EXPO_PUBLIC_ENVIRONMENT as Environment;
  if (envFromBuild && environments[envFromBuild]) {
    return envFromBuild;
  }

  // Default to production for release builds
  return 'production';
};

// Get current environment configuration
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const currentEnv = getCurrentEnvironment();
  return environments[currentEnv];
};

// Export current config for easy access
export const config = getEnvironmentConfig();

// Helper functions
export const isProduction = () => config.ENVIRONMENT === 'production';
export const isDevelopment = () => config.ENVIRONMENT === 'development';
export const isStaging = () => config.ENVIRONMENT === 'staging';

// Debug logging helper
export const debugLog = (message: string, ...args: any[]) => {
  if (config.DEBUG) {
    console.log(`[${config.ENVIRONMENT.toUpperCase()}] ${message}`, ...args);
  }
};

// API URL helpers
export const getApiUrl = (endpoint: string = '') => {
  const baseUrl = config.API_BASE_URL.endsWith('/') 
    ? config.API_BASE_URL.slice(0, -1) 
    : config.API_BASE_URL;
  
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

export const getHealthCheckUrl = () => getApiUrl('/health');

// Environment info for debugging
export const getEnvironmentInfo = () => ({
  environment: config.ENVIRONMENT,
  apiBaseUrl: config.API_BASE_URL,
  appName: config.APP_NAME,
  version: config.VERSION,
  debug: config.DEBUG,
  isDev: __DEV__,
}); 