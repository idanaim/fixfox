# Environment Configuration Setup

This document explains how to set up environment variables for the FixFox mobile app.

## Environment Variables

The app uses the following environment variables to configure API endpoints:

### Core Variables

- `EXPO_PUBLIC_USE_LOCAL_API`: Set to `'true'` to force local API usage
- `EXPO_PUBLIC_API_ENV`: Set to `'local'` for local development, `'production'` for deployed API
- `EXPO_PUBLIC_LOCAL_API_URL`: Override the default local API URL (default: `http://10.0.2.2:3000/api`)
- `EXPO_PUBLIC_DEPLOYED_API_URL`: Override the default deployed API URL

## Configuration Files

Create these files in the `mobile-app/` directory:

### `.env` (Default Development)
```bash
# Default environment configuration for development
EXPO_PUBLIC_API_ENV=local
EXPO_PUBLIC_USE_LOCAL_API=true
EXPO_PUBLIC_LOCAL_API_URL=http://10.0.2.2:3000/api
EXPO_PUBLIC_DEPLOYED_API_URL=http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api
EXPO_PUBLIC_DEBUG_API=true
```

### `.env.local` (Local Development Override)
```bash
# Local development override
EXPO_PUBLIC_API_ENV=local
EXPO_PUBLIC_LOCAL_API_URL=http://10.0.2.2:3000/api
```

### `.env.production` (Production Build)
```bash
# Production environment
EXPO_PUBLIC_API_ENV=production
EXPO_PUBLIC_USE_LOCAL_API=false
EXPO_PUBLIC_DEPLOYED_API_URL=http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api
EXPO_PUBLIC_DEBUG_API=false
```

### `.env.staging` (Staging Environment)
```bash
# Staging environment
EXPO_PUBLIC_API_ENV=staging
EXPO_PUBLIC_USE_LOCAL_API=false
EXPO_PUBLIC_DEPLOYED_API_URL=http://fixfox-staging-alb.us-west-2.elb.amazonaws.com/api
EXPO_PUBLIC_DEBUG_API=true
```

## Logic Flow

The `useLocalAPI` variable is determined by this logic:

1. **Explicit Override**: If `EXPO_PUBLIC_USE_LOCAL_API=true`, use local API
2. **Environment Check**: If `EXPO_PUBLIC_API_ENV=local`, use local API  
3. **Development Default**: If in `__DEV__` mode and no env vars set, use local API
4. **Production Default**: Otherwise, use deployed API

## Usage Examples

### Development (Default)
```bash
# No env vars needed - defaults to local API in __DEV__ mode
npx expo start
```

### Force Production API in Development
```bash
EXPO_PUBLIC_API_ENV=production npx expo start
```

### Custom Local API URL
```bash
EXPO_PUBLIC_LOCAL_API_URL=http://192.168.1.100:3000/api npx expo start
```

### Production Build
```bash
EXPO_PUBLIC_API_ENV=production npx expo build
```

## Android Emulator Network

For Android emulator, use `10.0.2.2` instead of `localhost` to reach the host machine:
- `http://10.0.2.2:3000/api` (Android emulator)
- `http://localhost:3000/api` (iOS simulator/web)

## Verification

Check the console logs when the app starts to verify the configuration:
```
🚀 API Configuration: {
  isDevelopment: true,
  useLocalAPI: true,
  currentAPI: "http://10.0.2.2:3000/api",
  environment: "LOCAL",
  envVars: { ... }
}
``` 