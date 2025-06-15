import { config } from './config/environment';

// Export the API base URL from environment configuration
export const API_BASE_URL = config.API_BASE_URL;

// Export other configuration values
export const API_TIMEOUT = config.API_TIMEOUT;
export const DEBUG = config.DEBUG;
export const APP_NAME = config.APP_NAME;
export const VERSION = config.VERSION; 