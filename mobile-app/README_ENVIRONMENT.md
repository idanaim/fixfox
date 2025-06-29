# Environment Configuration for FixFox Mobile App

This document explains the complete environment-driven configuration system for the FixFox mobile application.

## Overview

The app now uses **environment variables** instead of hardcoded configuration to determine API endpoints. This prevents production deployment issues and provides flexible configuration for different environments.

## Quick Start

### Development (Local API)
```bash
npm run start:local
# or
npm start  # defaults to local in development
```

### Production API Testing
```bash
npm run start:production
```

### Staging Environment
```bash
npm run start:staging
```

## Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `EXPO_PUBLIC_API_ENV` | Environment type | `local` (dev) / `production` (prod) | `local`, `staging`, `production` |
| `EXPO_PUBLIC_USE_LOCAL_API` | Force local API usage | `undefined` | `true`, `false` |
| `EXPO_PUBLIC_LOCAL_API_URL` | Local API endpoint | `http://10.0.2.2:3000/api` | `http://192.168.1.100:3000/api` |
| `EXPO_PUBLIC_DEPLOYED_API_URL` | Production API endpoint | AWS ALB URL | Custom production URL |
| `EXPO_PUBLIC_DEBUG_API` | Enable API debugging | `true` (dev) / `false` (prod) | `true`, `false` |

## Configuration Files

The app uses these environment files (in order of precedence):

1. `.env.local` - Local development overrides
2. `.env` - Default development configuration
3. `.env.production` - Production environment
4. `.env.staging` - Staging environment

### `.env` (Default Development)
```bash
EXPO_PUBLIC_API_ENV=local
EXPO_PUBLIC_USE_LOCAL_API=true
EXPO_PUBLIC_LOCAL_API_URL=http://10.0.2.2:3000/api
EXPO_PUBLIC_DEPLOYED_API_URL=http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api
EXPO_PUBLIC_DEBUG_API=true
```

### `.env.production` (Production)
```bash
EXPO_PUBLIC_API_ENV=production
EXPO_PUBLIC_USE_LOCAL_API=false
EXPO_PUBLIC_DEPLOYED_API_URL=http://fixfox-alb-prod-1210845738.us-west-2.elb.amazonaws.com/api
EXPO_PUBLIC_DEBUG_API=false
```

## API Selection Logic

The system determines which API to use based on this priority:

1. **Explicit Override**: `EXPO_PUBLIC_USE_LOCAL_API=true/false`
2. **Environment Setting**: `EXPO_PUBLIC_API_ENV=local` → use local API
3. **Development Default**: `__DEV__ = true` and no env vars → use local API
4. **Production Default**: Otherwise → use deployed API

## Network Configuration

### Android Emulator
- Use `10.0.2.2` to reach host machine
- Default: `http://10.0.2.2:3000/api`

### iOS Simulator / Web
- Use `localhost` for local development
- Example: `http://localhost:3000/api`

### Custom Network
```bash
# For custom local IP (e.g., different machine)
EXPO_PUBLIC_LOCAL_API_URL=http://192.168.1.100:3000/api npm start
```

## Available Scripts

### Start Scripts
- `npm start` - Default development (uses .env files)
- `npm run start:local` - Force local API
- `npm run start:production` - Use production API
- `npm run start:staging` - Use staging API

### Environment Scripts
- `npm run env:local` - Show local environment vars
- `npm run env:production` - Show production environment vars
- `npm run env:staging` - Show staging environment vars

### Build Scripts
- `npm run build:production` - Build with production API
- `npm run build:android` - Standard Android build
- `npm run build:ios` - Standard iOS build

## Manual Environment Setup

### Using the Helper Script
```bash
# Set environment and show variables
./scripts/set-env.sh local
./scripts/set-env.sh production
./scripts/set-env.sh staging

# Use with expo start
source ./scripts/set-env.sh production && npx expo start
```

### Direct Environment Variables
```bash
# Force production API in development
EXPO_PUBLIC_API_ENV=production npx expo start

# Custom API URL
EXPO_PUBLIC_LOCAL_API_URL=http://custom-api:3000/api npx expo start

# Debug mode with production API
EXPO_PUBLIC_API_ENV=production EXPO_PUBLIC_DEBUG_API=true npx expo start
```

## Type-Safe Configuration

The app includes TypeScript utilities for environment configuration:

```typescript
import { 
  getEnvironmentConfig, 
  getApiBaseUrl, 
  shouldUseLocalAPI,
  ApiEnvironment 
} from './src/config/environment';

// Get current configuration
const config = getEnvironmentConfig();
console.log(config.apiEnv); // 'local' | 'staging' | 'production'
console.log(config.useLocalAPI); // boolean
console.log(config.debugApi); // boolean

// Get API URL
const apiUrl = getApiBaseUrl();
```

## Debugging

### Console Logs
The app logs environment configuration on startup:
```
🚀 Environment Configuration: {
  apiEnv: "local",
  useLocalAPI: true,
  currentApiUrl: "http://10.0.2.2:3000/api",
  isDevelopment: true,
  debugApi: true,
  envVars: { ... }
}
```

### Verification Commands
```bash
# Check environment files are loaded
npx expo start | grep "env: load"

# Verify environment variables
npx expo start | grep "env: export"
```

## Production Deployment

### EAS Build
```bash
# Production build with environment
EXPO_PUBLIC_API_ENV=production eas build --platform all

# Or use the npm script
npm run build:production
```

### Environment Variables in EAS
Add to `eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_ENV": "production",
        "EXPO_PUBLIC_USE_LOCAL_API": "false"
      }
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **App still uses wrong API**: Clear Metro cache with `npx expo start --clear`
2. **Environment variables not loaded**: Check file names (must start with `EXPO_PUBLIC_`)
3. **Android can't reach localhost**: Use `10.0.2.2` instead of `localhost`
4. **iOS simulator issues**: Use `localhost` for iOS, `10.0.2.2` for Android

### Debug Steps
1. Check console logs for environment configuration
2. Verify `.env` files exist and have correct format
3. Ensure backend server is running on expected port
4. Test API endpoint manually with curl
5. Check network connectivity from emulator/simulator

## Migration Notes

### Before (Hardcoded)
```typescript
const useLocalAPI = true; // ❌ Hardcoded
```

### After (Environment-Driven)
```typescript
const useLocalAPI = shouldUseLocalAPI(); // ✅ Environment-driven
```

This change ensures:
- ✅ No hardcoded configuration in production
- ✅ Flexible environment switching
- ✅ Type-safe configuration
- ✅ Proper development/production separation 