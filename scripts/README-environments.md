# FixFox Multi-Environment Deployment

This guide covers the complete setup for deploying FixFox API to both **Development** and **Production** environments using AWS App Runner.

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐
│   Development   │    │   Production    │
│                 │    │                 │
│ Branch: dev     │    │ Branch: main    │
│ Service: -dev   │    │ Service: -prod  │
│ CPU: 0.25 vCPU  │    │ CPU: 0.5 vCPU   │
│ Memory: 0.5 GB  │    │ Memory: 1 GB    │
└─────────────────┘    └─────────────────┘
```

## 🚀 **Quick Start**

### **1. First Time Setup (One-time)**

#### **Authorize GitHub (Required)**
1. Go to: https://console.aws.amazon.com/apprunner/
2. Click "Create service" → "Source code repository"
3. Click "Add new" next to GitHub
4. Authorize AWS App Runner
5. Cancel the creation (we'll use scripts)

#### **Create Development Environment**
```bash
./scripts/setup-app-runner-dev.sh
```

#### **Create Production Environment**
```bash
./scripts/setup-app-runner-prod.sh
```

### **2. Daily Development Workflow**

#### **Deploy to Development**
```bash
./scripts/deploy-dev.sh
```

#### **Deploy to Production** (with confirmation)
```bash
./scripts/deploy-prod.sh
```

## 📋 **Available Scripts**

### **Setup Scripts (One-time)**
| Script | Environment | Branch | Service Name |
|--------|-------------|--------|--------------|
| `setup-app-runner-dev.sh` | Development | `dev` | `fixfox-api-dev` |
| `setup-app-runner-prod.sh` | Production | `main` | `fixfox-api-prod` |

### **Deployment Scripts (Daily use)**
| Script | Environment | Features |
|--------|-------------|----------|
| `deploy-dev.sh` | Development | Quick deployment |
| `deploy-prod.sh` | Production | Confirmation prompt + Health checks |

### **Health Check Scripts**
| Script | Purpose |
|--------|---------|
| `health-check.sh` | Quick health check (original - dev only) |

## 🌿 **Branch Strategy**

### **Development Branch (`dev`)**
- **Purpose:** Feature development and testing
- **Auto-deploy:** Push to `dev` → Deploy to Development
- **Service:** `fixfox-api-dev`
- **Resources:** 0.25 vCPU, 0.5 GB RAM (cost-effective)

### **Production Branch (`main`)**
- **Purpose:** Live production environment
- **Auto-deploy:** Push to `main` → Deploy to Production
- **Service:** `fixfox-api-prod`
- **Resources:** 0.5 vCPU, 1 GB RAM (better performance)
- **Safety:** Manual confirmation required for local deployments

## 🔄 **Deployment Workflows**

### **Automatic Deployments (GitHub Actions)**

#### **Development**
```yaml
Push to 'dev' branch → GitHub Actions → Deploy to Development
```

#### **Production**
```yaml
Push to 'main' branch → GitHub Actions → Deploy to Production
```

#### **Manual Trigger**
You can also manually trigger deployments from GitHub Actions:
1. Go to Actions tab in GitHub
2. Select "Deploy to AWS App Runner"
3. Click "Run workflow"
4. Choose environment (dev/prod)

### **Local Deployments**

#### **Development Deployment**
```bash
# Quick development deployment
./scripts/deploy-dev.sh
```

#### **Production Deployment**
```bash
# Production deployment with confirmation
./scripts/deploy-prod.sh
# You'll be prompted: "Are you sure you want to continue? (yes/no):"
```

## 📊 **Service Specifications**

### **Development Environment**
```json
{
  "ServiceName": "fixfox-api-dev",
  "Branch": "dev",
  "CPU": "0.25 vCPU",
  "Memory": "0.5 GB",
  "AutoDeploy": true,
  "HealthCheck": "/api/health"
}
```

### **Production Environment**
```json
{
  "ServiceName": "fixfox-api-prod",
  "Branch": "main",
  "CPU": "0.5 vCPU",
  "Memory": "1 GB",
  "AutoDeploy": true,
  "HealthCheck": "/api/health"
}
```

## 🏥 **Health Monitoring**

Both environments include comprehensive health monitoring:

- **Health Endpoint:** `/api/health`
- **Check Interval:** 10 seconds
- **Timeout:** 5 seconds
- **Healthy Threshold:** 1 success
- **Unhealthy Threshold:** 5 failures

## 💰 **Cost Optimization**

### **Development Environment**
- **CPU:** 0.25 vCPU (minimal cost)
- **Memory:** 0.5 GB
- **Usage:** Only during development hours
- **Auto-pause:** Consider pausing when not in use

### **Production Environment**
- **CPU:** 0.5 vCPU (better performance)
- **Memory:** 1 GB
- **Usage:** 24/7 availability
- **Scaling:** Auto-scales based on traffic

## 🔧 **Configuration Management**

### **Environment Variables**
Both environments can have different configurations:

```bash
# Development
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug

# Production
NODE_ENV=production
DEBUG=false
LOG_LEVEL=info
```

### **Database Connections**
- **Development:** Use development database
- **Production:** Use production database with connection pooling

## 🚨 **Safety Features**

### **Production Safeguards**
1. **Manual Confirmation:** Local production deployments require explicit confirmation
2. **Branch Protection:** Only `main` branch deploys to production
3. **Health Checks:** Comprehensive health monitoring
4. **Rollback:** Easy rollback through AWS Console

### **Development Freedom**
1. **No Confirmation:** Quick deployments for rapid iteration
2. **Lower Resources:** Cost-effective for testing
3. **Flexible:** Easy to experiment and test

## 📈 **Monitoring & Logs**

### **AWS Console Links**
- **App Runner Console:** https://console.aws.amazon.com/apprunner/
- **CloudWatch Logs:** https://console.aws.amazon.com/cloudwatch/

### **Service URLs**
After deployment, you'll get URLs like:
- **Development:** `https://abc123.us-west-2.awsapprunner.com`
- **Production:** `https://def456.us-west-2.awsapprunner.com`

## 🔄 **Typical Development Flow**

### **Feature Development**
```bash
# 1. Create feature branch from dev
git checkout dev
git pull origin dev
git checkout -b feature/new-feature

# 2. Develop and test locally
npm run dev

# 3. Commit and push to feature branch
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# 4. Create PR to dev branch
# 5. Merge PR → Auto-deploy to Development

# 6. Test in development environment
./scripts/health-check.sh  # or visit dev URL

# 7. When ready, create PR from dev to main
# 8. Merge PR → Auto-deploy to Production
```

### **Hotfix Flow**
```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# 2. Fix the issue
# 3. Test locally

# 4. Deploy to development first
git push origin hotfix/critical-fix
# Create PR to dev, merge, test

# 5. Deploy to production
# Create PR to main, merge → Auto-deploy
```

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **Service Not Found**
```bash
❌ App Runner service 'fixfox-api-dev' not found.
```
**Solution:** Run the setup script first:
```bash
./scripts/setup-app-runner-dev.sh
```

#### **GitHub Authorization**
```bash
❌ Authentication configuration is invalid.
```
**Solution:** Authorize GitHub in AWS Console (see Quick Start)

#### **Health Check Failures**
```bash
❌ All health check attempts failed
```
**Solutions:**
- Wait a few more minutes (service starting up)
- Check CloudWatch logs for errors
- Verify `/api/health` endpoint exists

### **Getting Help**

1. **Check service status:**
   ```bash
   ./scripts/check-app-runner-status.sh
   ```

2. **View logs in AWS Console:**
   - Go to App Runner Console
   - Select your service
   - Click "Logs" tab

3. **Manual health check:**
   ```bash
   curl https://your-service-url.awsapprunner.com/api/health
   ```

## 🎯 **Best Practices**

### **Development**
- Deploy frequently to catch issues early
- Use development environment for all testing
- Keep development branch up to date

### **Production**
- Only deploy tested code from `main`
- Monitor health after deployments
- Have rollback plan ready
- Use production confirmation prompts

### **Security**
- Never commit secrets to repository
- Use environment variables for configuration
- Regularly rotate AWS credentials
- Monitor access logs

---

## 📞 **Quick Reference**

### **Setup (One-time)**
```bash
# 1. Authorize GitHub in AWS Console
# 2. Create environments
./scripts/setup-app-runner-dev.sh
./scripts/setup-app-runner-prod.sh
```

### **Daily Development**
```bash
# Deploy to development
./scripts/deploy-dev.sh

# Deploy to production (with confirmation)
./scripts/deploy-prod.sh

# Check health
./scripts/health-check.sh
```

### **Emergency**
```bash
# Quick status check
./scripts/check-app-runner-status.sh

# Manual health check
curl https://your-url/api/health
``` 