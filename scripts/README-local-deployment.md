# Local Deployment Scripts

This directory contains scripts for deploying and monitoring your FixFox API from your local machine.

## Prerequisites

1. **AWS CLI configured** with appropriate credentials:
   ```bash
   aws configure
   ```

2. **App Runner service already created**. If not created yet:
   ```bash
   ./scripts/setup-app-runner.sh
   ```

3. **Required tools**:
   - `curl` (for health checks)
   - `jq` (for JSON parsing)

## Scripts

### 1. `deploy-local.sh` - Full Deployment with Health Check

Deploys your application to AWS App Runner and performs comprehensive health checks.

```bash
./scripts/deploy-local.sh
```

**What it does:**
- ✅ Verifies AWS credentials
- 🔍 Finds your App Runner service
- 🚀 Triggers deployment
- ⏳ Waits for deployment completion (up to 10 minutes)
- 🏥 Performs health checks with retries
- 📊 Shows detailed service information
- 🔗 Provides useful links

**Example output:**
```
🚀 FixFox Local Deployment Script
==================================
Service: fixfox-api
Region: us-west-2

✅ AWS credentials verified
🔍 Looking for App Runner service...
✅ Service found
ARN: arn:aws:apprunner:us-west-2:123456789:service/fixfox-api/abc123

🚀 Starting deployment...
✅ Deployment started successfully!
Deployment ID: 12345678-1234-1234-1234-123456789012

⏳ Waiting for deployment to complete...
This usually takes 3-5 minutes

🎉 Deployment completed successfully!

📊 Getting service information...
Status: RUNNING
🌐 Service URL: https://abc123.us-west-2.awsapprunner.com
🏥 Health Check URL: https://abc123.us-west-2.awsapprunner.com/api/health

🏥 Performing health checks...
Attempt 1/5...
✅ Health check passed! (HTTP 200)

📊 Health Details:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 1234567
}

🎉 Deployment process completed!
Your FixFox API is now live and auto-scaling!
```

### 2. `health-check.sh` - Quick Health Check

Performs a quick health check on your deployed API without deploying.

```bash
./scripts/health-check.sh
```

**What it does:**
- 🔍 Gets service information
- 🏥 Performs health check with retries
- 📊 Shows health details

**Example output:**
```
🏥 FixFox API Health Check
==========================

🔍 Getting service information...
Service Status: RUNNING
Service URL: https://abc123.us-west-2.awsapprunner.com
Health Endpoint: https://abc123.us-west-2.awsapprunner.com/api/health

🏥 Performing health check...
Attempt 1/3...
✅ Health check passed! (HTTP 200)

📊 Health Details:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 1234567
}

🎉 API is healthy and responding!
```

### 3. `check-app-runner-status.sh` - Detailed Status Check

Shows comprehensive status information about your App Runner service.

```bash
./scripts/check-app-runner-status.sh
```

## Usage Examples

### Deploy and Check Health
```bash
# Full deployment with health check
./scripts/deploy-local.sh
```

### Quick Health Check Only
```bash
# Just check if API is healthy
./scripts/health-check.sh
```

### Check Service Status
```bash
# Get detailed service information
./scripts/check-app-runner-status.sh
```

### Chain Commands
```bash
# Deploy and then check status
./scripts/deploy-local.sh && ./scripts/check-app-runner-status.sh
```

## Troubleshooting

### Common Issues

1. **AWS CLI not configured**
   ```
   ❌ AWS CLI not configured or credentials invalid
   ```
   **Solution:** Run `aws configure` and enter your credentials.

2. **Service not found**
   ```
   ❌ App Runner service 'fixfox-api' not found.
   ```
   **Solution:** Create the service first with `./scripts/setup-app-runner.sh`

3. **Health check fails**
   ```
   ❌ All health check attempts failed
   ```
   **Solutions:**
   - Wait a few more minutes (service might still be starting)
   - Check App Runner console for errors
   - Verify your application's health endpoint

4. **Deployment timeout**
   ```
   ⚠️ Deployment is taking longer than expected
   ```
   **Solution:** Check the App Runner console for detailed status.

## Configuration

You can modify these variables at the top of each script:

```bash
SERVICE_NAME="fixfox-api"          # Your App Runner service name
REGION="us-west-2"                 # AWS region
MAX_WAIT_TIME=600                  # Max wait time for deployment (seconds)
HEALTH_CHECK_RETRIES=5             # Number of health check attempts
```

## Links

- [App Runner Console](https://console.aws.amazon.com/apprunner/)
- [CloudWatch Logs](https://console.aws.amazon.com/cloudwatch/home?region=us-west-2#logsV2:log-groups)
- [Setup Guide](./app-runner-setup-guide.md) 