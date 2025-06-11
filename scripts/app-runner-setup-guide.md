# AWS App Runner Setup Guide for FixFox API (FREE TIER OPTIMIZED)

## 🆓 Free Tier Benefits
- **2,000 build minutes/month** - FREE
- **Pay-per-use pricing** - Only pay when your app is running
- **No upfront costs** - Perfect for development and testing

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

### 5. Service Settings (FREE TIER OPTIMIZED)
1. **Service name**: `fixfox-api`
2. **Virtual CPU**: `0.25 vCPU` ⭐ **CHEAPEST OPTION**
3. **Memory**: `0.5 GB` ⭐ **CHEAPEST OPTION**
4. **Environment variables** (if not in apprunner.yaml):
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `OPENAI_API_KEY` = `dummy-key-for-production`

### 6. Auto Scaling (FREE TIER FRIENDLY)
1. **Minimum size**: `1` ⭐ **MINIMUM FOR COST SAVINGS**
2. **Maximum size**: `3` ⭐ **KEEP LOW TO CONTROL COSTS**

### 7. Health Check
1. **Protocol**: `HTTP`
2. **Path**: `/api/health`
3. **Interval**: `20 seconds` ⭐ **LONGER INTERVAL = LESS COST**
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

## 💰 FREE TIER Cost Breakdown
### Build Minutes (FREE)
- **2,000 minutes/month** included in free tier
- **Your usage**: ~2-5 minutes per deployment
- **Estimated deployments**: 400-1000 per month FREE

### Compute Costs (Pay-per-use)
- **0.25 vCPU + 0.5 GB**: $0.007/hour when running
- **If running 24/7**: ~$5/month
- **If running 8 hours/day**: ~$1.68/month
- **If running only during testing**: <$1/month

### 💡 Cost Optimization Tips
1. **Pause service** when not actively developing
2. **Use minimum instance size** (0.25 vCPU, 0.5 GB)
3. **Keep auto-scaling max low** (3 instances max)
4. **Monitor usage** in AWS billing dashboard

## 🆚 vs Other Services
| Service | Monthly Cost | Setup Time | Complexity |
|---------|-------------|------------|------------|
| **App Runner** | **$1-5** | **3 min** | **Low** |
| Elastic Beanstalk | $8-20 | 10 min | Medium |
| EC2 | $8-15 | 30 min | High |
| Lambda | $0-2 | 15 min | Medium |

## 🛑 How to Pause Service (Save Money)
1. Go to App Runner console
2. Select your service
3. Click **"Actions"** → **"Pause service"**
4. Service stops running = $0 compute costs
5. Resume anytime in 1-2 minutes

## ✅ Perfect for Free Tier Because:
- ✅ **No minimum charges** - Pay only when running
- ✅ **2,000 free build minutes** - Covers all your deployments
- ✅ **Smallest instance size** - 0.25 vCPU, 0.5 GB
- ✅ **Easy to pause** - Stop costs when not needed
- ✅ **Auto-scaling** - Won't over-provision resources 

## 🔧 Manual Build Configuration

Since you can't see the "Use a configuration file" option, let's configure it manually. Here's exactly what to enter:

### Build Configuration Fields:

#### 1. **Build command**:
```bash
npm ci && NX_CLOUD_DISTRIBUTED_EXECUTION=false npx nx build rest-man-server --skip-nx-cache && mkdir -p deployment && cp -r dist/apps/rest-man-server/* deployment/ && cp package.json deployment/ && cp package-lock.json deployment/ && cd deployment && npm ci --production
```

#### 2. **Start command**:
```bash
cd deployment && npm start
```

#### 3. **Runtime**:
- Select: **Node.js 18**

#### 4. **Output directory** (if asked):
```
deployment
```

### Environment Variables:
Add these one by one:

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `OPENAI_API_KEY` | `dummy-key-for-production` |

### Service Settings (Next Step):
1. **Service name**: `fixfox-api`
2. **Virtual CPU**: `0.25 vCPU`
3. **Memory**: `0.5 GB`
4. **Auto scaling max**: `3`

## 🤔 Alternative: Check Different Location

Sometimes the configuration file option is in a different place. Can you tell me:

1. **What options do you see** in the repository configuration section?
2. **Are there any tabs** like "Manual" vs "Automatic" or "Build settings" vs "Configuration file"?
3. **What does your current screen look like** - can you describe the fields you see?

This will help me guide you to the right option! The configuration file approach is definitely preferred if we can find it. 