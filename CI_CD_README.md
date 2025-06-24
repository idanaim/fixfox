# FixFox CI/CD Documentation

## Overview 🚀

FixFox now uses a modern CI/CD pipeline with **Node.js 20+** after separating from the Nx monorepo. The pipeline includes automated testing, building, and deployment for both the server and mobile app.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Server API    │    │   Mobile App    │    │   Infrastructure│
│   (NestJS)      │    │   (Expo)        │    │   (AWS/Docker)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │                 │
                    │  GitHub Actions │
                    │  CI/CD Pipeline │
                    │                 │
                    └─────────────────┘
```

## Workflows

### 1. Continuous Integration (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

**Features:**
- **Smart change detection** - Only runs relevant jobs based on file changes
- **Multi-version testing** - Tests server on Node 20 & 21
- **Unit testing only** - E2E tests excluded for performance
- **Security auditing** - Runs `npm audit` on dependencies
- **Docker validation** - Tests Docker build process
- **Parallel execution** - Runs server and mobile tests simultaneously

### 2. Server Deployment (`.github/workflows/deploy.yml`)

**Triggers:**
- Push to `main` branch (server changes)
- Manual workflow dispatch

**Features:**
- **Pre-deployment testing** - Runs full test suite before deployment
- **Docker image building** - Builds optimized production images
- **AWS ECR integration** - Pushes images to Amazon ECR
- **ECS auto-deployment** - Optionally triggers ECS service updates

### 3. Mobile App CI/CD (`.github/workflows/mobile-ci.yml`)

**Triggers:**
- Push to `main` branch (mobile app changes)
- Pull requests affecting mobile app
- Manual workflow dispatch

**Features:**
- **Expo validation** - Runs `expo-doctor` checks
- **TypeScript checking** - Validates type safety
- **Preview builds** - Creates preview builds for PRs
- **Production builds** - Creates production builds for main branch
- **Store submission** - Optional automatic app store submission

## Configuration

### Environment Variables

#### GitHub Secrets
```bash
# AWS Deployment
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Expo/Mobile App
EXPO_TOKEN=your_expo_access_token
```

#### GitHub Variables
```bash
# ECS Deployment (optional)
ECS_CLUSTER_NAME=your_ecs_cluster
ECS_SERVICE_NAME=your_ecs_service

# Mobile App Store Submission
AUTO_SUBMIT=true  # Set to enable automatic store submission
```

### Local Development

#### Server
```bash
cd server
npm install
npm run start:dev    # Development with hot reload
npm run build        # Production build
npm run start:prod   # Production server
```

#### Mobile App
```bash
cd mobile-app
npm install
npm start           # Start Expo development server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run on web
```

## Deployment Process

### Server Deployment

1. **Push to main** → Triggers CI/CD pipeline
2. **Tests run** → Validates code quality and functionality
3. **Docker build** → Creates optimized production image
4. **Push to ECR** → Uploads image to AWS Elastic Container Registry
5. **ECS update** → (Optional) Updates running ECS service

### Mobile App Deployment

1. **Push to main** → Triggers mobile CI/CD
2. **Expo validation** → Runs compatibility checks
3. **Build creation** → Creates production builds via EAS
4. **Store submission** → (Optional) Submits to app stores

## Features

### 🎯 Smart Change Detection
- Only runs relevant workflows based on changed files
- Improves CI/CD performance and reduces costs

### 🔒 Security First
- Regular security audits via `npm audit`
- Multi-version Node.js testing
- Secure credential management

### 📱 Mobile-First
- Expo-optimized builds
- Preview builds for PRs
- Automated store submission

### 🐳 Docker Optimization
- Multi-stage builds for smaller images
- Node.js 20 Alpine base
- Security-hardened containers

### ⚡ Performance
- Parallel job execution
- Dependency caching
- Concurrency controls

## Monitoring

### Build Status
Check build status at: `https://github.com/your-org/fixfox/actions`

### Health Checks
- Server: `GET /api/health`
- Mobile: Built-in Expo development tools

## Troubleshooting

### Common Issues

1. **Node version mismatch**
   ```bash
   # Check Node version in package.json engines field
   "engines": {
     "node": ">=20.0.0"
   }
   ```

2. **Docker build failures**
   ```bash
   # Test Docker build locally
   docker build -t fixfox-server:test .
   ```

3. **Expo build issues**
   ```bash
   # Run Expo doctor
   npx expo-doctor
   ```

### Debug Commands

```bash
# Check workflow status
gh workflow list
gh run list --workflow=ci.yml

# View workflow logs
gh run view <run-id> --log

# Trigger manual deployment
gh workflow run deploy.yml

# Check ECS service status
aws ecs describe-services --cluster your-cluster --services your-service
```

## Migration from Nx

The migration from Nx to standalone structure included:

- ✅ **Node.js upgrade** - Now using Node 20+
- ✅ **Simplified build process** - Direct npm scripts instead of Nx
- ✅ **Reduced complexity** - Fewer dependencies and configurations
- ✅ **Better performance** - Faster builds and deployments
- ✅ **Improved developer experience** - Clearer project structure

## Future Enhancements

- [ ] Blue-green deployments
- [ ] Automated database migrations
- [ ] Performance monitoring integration
- [ ] Multi-environment support (staging, production)
- [ ] Automated security scanning
- [ ] Release automation with semantic versioning

---

**Last updated:** December 2024  
**Node.js version:** 20+  
**CI/CD Platform:** GitHub Actions 