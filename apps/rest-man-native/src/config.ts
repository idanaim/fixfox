// Environment configuration
const isDevelopment = __DEV__;
const useLocalAPI = true; // Set to true to use local API, false for deployed API

const LOCAL_API_URL = 'http://localhost:3000/api';
const DEPLOYED_API_URL = 'http://fixfox-alb-dev-896725991.us-west-2.elb.amazonaws.com/api';

// Choose API URL based on configuration
export const API_BASE_URL = useLocalAPI ? LOCAL_API_URL : DEPLOYED_API_URL;

// Export individual URLs for reference
export const LOCAL_API = LOCAL_API_URL;
export const DEPLOYED_API = DEPLOYED_API_URL;

// Log current configuration
console.log('🚀 API Configuration:', {
  isDevelopment,
  useLocalAPI,
  currentAPI: API_BASE_URL,
  environment: useLocalAPI ? 'LOCAL' : 'DEPLOYED'
}); 