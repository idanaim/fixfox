# FixFox Mobile App Deployment Guide

This guide covers how to configure and deploy your React Native app to connect to the correct API endpoints for different environments.

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│                 │    │                 │    │                 │
│ Local Dev       │    │ TestFlight/     │    │ App Store/      │
│ Expo Go         │    │ Internal        │    │ Play Store      │
│                 │    │                 │    │                 │
│ localhost:3000  │    │ fixfox-api-dev  │    │ fixfox-api-prod │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 **Environment Configuration**

### **Automatic Environment Detection**

The app automatically detects the environment based on:

1. **Development Mode (`__DEV__`)**: Uses localhost
2. **Build Environment Variable**: Uses `EXPO_PUBLIC_ENVIRONMENT`
3. **Default**: Falls back to production

### **Environment Settings**

| Environment | API Endpoint | Debug | Build Profile |
|-------------|--------------|-------|---------------|
| Development | `localhost:3000` | ✅ | `development` |
| Staging | `fixfox-api-dev` | ✅ | `staging` |
| Production | `fixfox-api-prod` | ❌ | `production` |

## 🚀 **Setup Process**

### **Step 1: Deploy Backend Services**

First, ensure your backend services are deployed:

```bash
# Create and deploy development environment
./scripts/setup-app-runner-dev.sh
./scripts/deploy-dev.sh

# Create and deploy production environment
./scripts/setup-app-runner-prod.sh
./scripts/deploy-prod.sh
```

### **Step 2: Update App Configuration**

After your App Runner services are deployed, update the mobile app configuration:

```bash
# Automatically fetch and update API URLs
./scripts/update-app-urls.sh
```

This script will:
- ✅ Fetch actual App Runner URLs
- ✅ Update the environment configuration
- ✅ Test API endpoints
- ✅ Create a backup of the old configuration

### **Step 3: Verify Configuration**

Check that the URLs were updated correctly:

```typescript
// apps/rest-man-native/src/config/environment.ts
staging: {
  API_BASE_URL: 'https://abc123.us-west-2.awsapprunner.com/api', // ✅ Updated
  // ...
},
production: {
  API_BASE_URL: 'https://def456.us-west-2.awsapprunner.com/api', // ✅ Updated
  // ...
},
```

## 📱 **Building and Testing**

### **Development Testing**

```bash
# Start local development
cd apps/rest-man-native
npx expo start

# The app will automatically use localhost:3000
```

### **Staging Build**

```bash
# Build for internal testing
eas build --profile staging

# This will:
# - Use staging API endpoint
# - Enable debug logging
# - Create APK/IPA for internal distribution
```

### **Production Build**

```bash
# Build for app stores
eas build --profile production

# This will:
# - Use production API endpoint
# - Disable debug logging
# - Create optimized builds for stores
```

## 🔍 **Environment Detection Logic**

```typescript
const getCurrentEnvironment = (): Environment => {
  // 1. Check if in Expo development mode
  if (__DEV__) {
    return 'development';
  }

  // 2. Check build environment variable
  const envFromBuild = process.env.EXPO_PUBLIC_ENVIRONMENT;
  if (envFromBuild && environments[envFromBuild]) {
    return envFromBuild;
  }

  // 3. Default to production
  return 'production';
};
```

## 🛠️ **Manual Configuration**

If you need to manually update API endpoints:

### **1. Edit Environment File**

```typescript
// apps/rest-man-native/src/config/environment.ts

const environments: Record<Environment, EnvironmentConfig> = {
  staging: {
    API_BASE_URL: 'https://YOUR_ACTUAL_DEV_URL/api',
    // ...
  },
  production: {
    API_BASE_URL: 'https://YOUR_ACTUAL_PROD_URL/api',
    // ...
  },
};
```

### **2. Test the Configuration**

```bash
# Test development mode
npx expo start

# Test staging build
eas build --profile staging --local

# Test production build
eas build --profile production --local
```

## 🧪 **Testing API Connections**

### **Debug Logging**

In development and staging, the app logs all API requests:

```typescript
// Example debug output
[DEVELOPMENT] API Configuration: {
  baseUrl: "http://localhost:3000/api",
  timeout: 10000,
  environment: "development"
}

[STAGING] API Request: {
  method: "GET",
  url: "/health",
  baseURL: "https://abc123.us-west-2.awsapprunner.com/api",
  hasAuth: false
}
```

### **Health Check Testing**

```bash
# Test development API
curl http://localhost:3000/api/health

# Test staging API
curl https://your-dev-url.awsapprunner.com/api/health

# Test production API
curl https://your-prod-url.awsapprunner.com/api/health
```

## 🔄 **Deployment Workflow**

### **Complete Development to Production Flow**

```bash
# 1. Develop locally
npx expo start  # Uses localhost

# 2. Deploy to staging
git push origin dev  # Auto-deploys to staging API

# 3. Build staging app
eas build --profile staging  # Uses staging API

# 4. Test staging app
# Install and test the staging build

# 5. Deploy to production
git push origin main  # Auto-deploys to production API

# 6. Update app configuration
./scripts/update-app-urls.sh

# 7. Build production app
eas build --profile production  # Uses production API

# 8. Submit to stores
eas submit --profile production
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. App Still Using Localhost**
```bash
# Check environment detection
console.log(getEnvironmentInfo());

# Verify build profile
eas build --profile staging --clear-cache
```

#### **2. API Connection Errors**
```bash
# Check API health
curl https://your-api-url/api/health

# Verify CORS settings in backend
# Check network connectivity
```

#### **3. Wrong Environment Detected**
```bash
# Check environment variable
echo $EXPO_PUBLIC_ENVIRONMENT

# Verify EAS configuration
cat apps/rest-man-native/eas.json
```

### **Debug Commands**

```bash
# Check current configuration
./scripts/update-app-urls.sh

# Test API endpoints
curl -v https://your-dev-url/api/health
curl -v https://your-prod-url/api/health

# Check app environment
npx expo start --clear
```

## 📊 **Environment Variables Reference**

### **EAS Build Profiles**

```json
{
  "build": {
    "development": {
      "env": { "EXPO_PUBLIC_ENVIRONMENT": "development" }
    },
    "staging": {
      "env": { "EXPO_PUBLIC_ENVIRONMENT": "staging" }
    },
    "production": {
      "env": { "EXPO_PUBLIC_ENVIRONMENT": "production" }
    }
  }
}
```

### **Runtime Configuration**

```typescript
interface EnvironmentConfig {
  API_BASE_URL: string;      // Backend API endpoint
  API_TIMEOUT: number;       // Request timeout (ms)
  ENVIRONMENT: Environment;  // Current environment
  DEBUG: boolean;           // Enable debug logging
  APP_NAME: string;         // App display name
  VERSION: string;          // App version
}
```

## 🎯 **Best Practices**

### **Development**
- ✅ Always test with local backend first
- ✅ Use debug logging to verify API calls
- ✅ Test on both iOS and Android simulators

### **Staging**
- ✅ Test with real staging API
- ✅ Verify all API endpoints work
- ✅ Test on physical devices
- ✅ Share builds with team for testing

### **Production**
- ✅ Only deploy tested code
- ✅ Verify production API health
- ✅ Test critical user flows
- ✅ Monitor app performance

### **Security**
- ✅ Never commit API keys to repository
- ✅ Use environment variables for secrets
- ✅ Verify HTTPS endpoints only
- ✅ Test authentication flows

---

## 📞 **Quick Reference**

### **Setup Commands**
```bash
# Update API URLs after backend deployment
./scripts/update-app-urls.sh

# Build for different environments
eas build --profile development
eas build --profile staging
eas build --profile production
```

### **Testing Commands**
```bash
# Local development
npx expo start

# Test API health
curl https://your-api-url/api/health

# Check environment info
console.log(getEnvironmentInfo());
```

### **Deployment Commands**
```bash
# Deploy backend
./scripts/deploy-dev.sh    # Staging API
./scripts/deploy-prod.sh   # Production API

# Submit to stores
eas submit --profile production
``` 