# AWS App Runner Troubleshooting Guide

## 🚨 **Current Issue: Deployment Fails After Successful Build**

### **Problem Description**
Your logs show:
- ✅ **Build Phase**: Completed successfully
- ✅ **Dependencies**: Installed correctly  
- ✅ **Docker Images**: Created successfully
- ❌ **Deployment**: Failed at runtime

### **Root Cause**
The issue was a **mismatch between the build output structure and startup command**:

1. **Build Process**: Creates `dist/apps/rest-man-server/main.js`
2. **Deployment Folder**: Copies files to `deployment/`
3. **Package.json**: Expected wrong file structure
4. **Startup Command**: Couldn't find the correct entry point

### **✅ Solution Applied**

#### **1. Fixed apprunner.yaml**
```yaml
# OLD (BROKEN)
command: cd deployment && npm start
# Package.json expected: node dist/apps/rest-man-server/main.js

# NEW (FIXED)  
command: cd deployment && node main.js
# Direct execution of the built main.js file
```

#### **2. Created Proper deployment-package.json**
```json
{
  "name": "fixfox-api",
  "main": "main.js",
  "scripts": {
    "start": "node main.js"
  },
  "dependencies": {
    // Only production dependencies needed
  }
}
```

#### **3. Updated Build Process**
```yaml
build:
  commands:
    build:
      - npm ci
      - npx nx build rest-man-server --skip-nx-cache
      - mkdir -p deployment
      - cp -r dist/apps/rest-man-server/* deployment/
      - cp deployment-package.json deployment/package.json  # ✅ Correct package.json
      - cd deployment && npm ci --production
```

## 🧪 **Testing Your Fix**

### **Step 1: Test Locally First**
```bash
# Run the local deployment test
./scripts/test-deployment-locally.sh
```

This will:
- ✅ Build your application
- ✅ Create deployment structure
- ✅ Test startup command
- ✅ Verify health endpoint
- ✅ Confirm everything works

### **Step 2: Deploy to App Runner**
```bash
# Commit your changes
git add .
git commit -m "Fix App Runner deployment configuration"

# Push to trigger deployment
git push origin main  # or dev for development environment
```

### **Step 3: Monitor Deployment**
```bash
# Check deployment status
./scripts/check-app-runner-status.sh

# Or manually check
aws apprunner describe-service --service-arn YOUR_SERVICE_ARN --region us-west-2
```

## 🔍 **Common App Runner Issues & Solutions**

### **Issue 1: Build Succeeds, Deployment Fails**

**Symptoms:**
- Build logs show success
- Deployment fails with no clear error
- Service status shows "CREATE_FAILED" or "UPDATE_FAILED"

**Solutions:**
1. **Check startup command**:
   ```yaml
   # Make sure this points to the correct file
   command: cd deployment && node main.js
   ```

2. **Verify file structure**:
   ```bash
   # Test locally first
   ./scripts/test-deployment-locally.sh
   ```

3. **Check package.json**:
   ```json
   {
     "main": "main.js",  // Must match your built file
     "scripts": {
       "start": "node main.js"  // Must be correct
     }
   }
   ```

### **Issue 2: Health Check Failures**

**Symptoms:**
- App starts but health checks fail
- Service shows "RUNNING" but not accessible

**Solutions:**
1. **Verify health endpoint**:
   ```typescript
   // Make sure this exists in your app
   @Get('health')
   getHealth() {
     return { status: 'ok' };
   }
   ```

2. **Check port configuration**:
   ```yaml
   network:
     port: 3000  # Must match your app's port
     env: PORT   # App Runner sets this automatically
   ```

3. **Test health endpoint locally**:
   ```bash
   curl http://localhost:3000/api/health
   ```

### **Issue 3: Environment Variable Issues**

**Symptoms:**
- App starts but can't connect to database
- Missing configuration errors

**Solutions:**
1. **Check environment variables**:
   ```yaml
   env:
     - name: DB_HOST
       value: "your-db-host"
     - name: NODE_ENV
       value: "production"
   ```

2. **Verify database connectivity**:
   ```bash
   # Test database connection
   psql -h fixfoxdb.cb8aywmkgppq.us-west-2.rds.amazonaws.com -U idanaim -d fixfoxdb
   ```

### **Issue 4: Dependency Issues**

**Symptoms:**
- Build fails during npm install
- Missing module errors at runtime

**Solutions:**
1. **Check package.json dependencies**:
   ```json
   {
     "dependencies": {
       // Include ALL runtime dependencies
       "@nestjs/common": "^10.0.2",
       "pg": "^8.13.1"
     }
   }
   ```

2. **Test production install**:
   ```bash
   cd deployment
   npm ci --production
   ```

### **Issue 5: Memory/CPU Issues**

**Symptoms:**
- App starts but crashes under load
- Out of memory errors

**Solutions:**
1. **Increase instance size**:
   ```bash
   # In App Runner console or via CLI
   # Change from 0.25 vCPU, 0.5 GB to 0.5 vCPU, 1 GB
   ```

2. **Optimize your application**:
   ```typescript
   // Add memory monitoring
   console.log('Memory usage:', process.memoryUsage());
   ```

## 📊 **Debugging Commands**

### **Check Service Status**
```bash
# Get service information
aws apprunner describe-service --service-arn YOUR_ARN --region us-west-2

# List all services
aws apprunner list-services --region us-west-2
```

### **View Logs**
```bash
# App Runner logs are in CloudWatch
# Go to: CloudWatch → Log Groups → /aws/apprunner/YOUR_SERVICE_NAME
```

### **Test Health Endpoint**
```bash
# Once deployed
curl https://your-app-runner-url/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-15T10:30:00.000Z","uptime":123}
```

### **Manual Deployment Trigger**
```bash
# Trigger deployment manually
aws apprunner start-deployment --service-arn YOUR_ARN --region us-west-2
```

## 🎯 **Prevention Checklist**

Before deploying to App Runner, always:

- [ ] ✅ Test locally with `./scripts/test-deployment-locally.sh`
- [ ] ✅ Verify `main.js` exists in build output
- [ ] ✅ Check `package.json` has correct `main` field
- [ ] ✅ Confirm startup command is correct
- [ ] ✅ Test health endpoint responds
- [ ] ✅ Verify all environment variables are set
- [ ] ✅ Check database connectivity
- [ ] ✅ Ensure all dependencies are in `deployment-package.json`

## 🆘 **Emergency Recovery**

If deployment is completely broken:

1. **Rollback to previous version**:
   ```bash
   # In App Runner console, go to Deployments tab
   # Click on a previous successful deployment
   # Click "Deploy this version"
   ```

2. **Pause service to stop costs**:
   ```bash
   aws apprunner pause-service --service-arn YOUR_ARN --region us-west-2
   ```

3. **Delete and recreate service**:
   ```bash
   # Last resort - will lose deployment history
   ./scripts/setup-app-runner-dev.sh  # or prod
   ```

## 📞 **Getting Help**

### **AWS Support Resources**
- [App Runner Documentation](https://docs.aws.amazon.com/apprunner/)
- [App Runner Troubleshooting](https://docs.aws.amazon.com/apprunner/latest/dg/troubleshooting.html)
- [CloudWatch Logs](https://console.aws.amazon.com/cloudwatch/)

### **FixFox Specific Help**
- Run: `./scripts/help.sh` for command reference
- Check: `docs/mobile-app-deployment.md` for complete setup
- Test: `./scripts/test-deployment-locally.sh` before deploying

---

## 🎉 **Success Indicators**

Your deployment is successful when:

- ✅ **Build Phase**: Completes without errors
- ✅ **Deployment Phase**: Completes successfully  
- ✅ **Service Status**: Shows "RUNNING"
- ✅ **Health Check**: Returns HTTP 200
- ✅ **API Endpoints**: Respond correctly
- ✅ **Database**: Connects successfully

**Example successful health check:**
```bash
$ curl https://abc123.us-west-2.awsapprunner.com/api/health
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 1234,
  "environment": "production"
}
```

🎯 **Your deployment should now work perfectly!** 