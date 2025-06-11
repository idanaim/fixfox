# AWS App Runner Setup Guide for FixFox API

## 🚀 Quick Setup Steps

### 1. Open AWS App Runner Console
Go to: https://console.aws.amazon.com/apprunner/

### 2. Create Service
1. Click **"Create service"**
2. Choose **"Source code repository"**

### 3. Connect to GitHub
1. Click **"Add new"** next to GitHub connection
2. **Connection name**: `github-fixfox`
3. Click **"Connect to GitHub"**
4. Authorize AWS App Runner in GitHub
5. Select **"Install a new app"** and choose your account
6. Select **"Only select repositories"** → Choose `fixfox`

### 4. Configure Repository
1. **Repository**: `idanaim/fixfox`
2. **Branch**: `backend-aws`
3. **Configuration file**: ✅ **Use a configuration file**
4. **Configuration file**: `apprunner.yaml`

### 5. Service Settings
1. **Service name**: `fixfox-api`
2. **Virtual CPU**: `0.25 vCPU`
3. **Memory**: `0.5 GB`
4. **Environment variables** (if not in apprunner.yaml):
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `OPENAI_API_KEY` = `dummy-key-for-production`

### 6. Auto Scaling (Optional)
1. **Minimum size**: `1`
2. **Maximum size**: `10`

### 7. Health Check
1. **Protocol**: `HTTP`
2. **Path**: `/api/health`
3. **Interval**: `10 seconds`
4. **Timeout**: `5 seconds`

### 8. Review and Create
1. Review all settings
2. Click **"Create & deploy"**

## ⏱️ Deployment Timeline
- **Initial deployment**: 3-5 minutes
- **Subsequent deployments**: 1-2 minutes
- **Auto-scaling**: Instant

## 🌐 After Deployment
Your API will be available at:
- **Service URL**: `https://[random-id].us-west-2.awsapprunner.com`
- **Health Check**: `https://[random-id].us-west-2.awsapprunner.com/api/health`

## 🔄 Auto-Deployment
Once set up, App Runner will automatically deploy when you push to the `backend-aws` branch!

## 💰 Cost Estimate
- **0.25 vCPU + 0.5 GB**: ~$7-15/month (depending on usage)
- **Free tier**: 2,000 build minutes/month
- **Pay-per-use**: Only charged when running

## 🆚 vs Elastic Beanstalk
- ✅ **Faster**: 3 min vs 10 min deployment
- ✅ **Simpler**: No infrastructure management
- ✅ **Auto-scaling**: Built-in, no configuration needed
- ✅ **Cost-effective**: Pay only for usage
- ✅ **Modern**: Container-based, serverless 