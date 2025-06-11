# 🚀 FixFox REST API Deployment Guide

This guide covers deploying your FixFox REST API server to AWS Elastic Beanstalk with automated CI/CD pipeline using GitHub Actions.

## 📋 Prerequisites

1. **AWS Account** with appropriate permissions
2. **GitHub Repository** (already set up ✅)
3. **Node.js 18+** installed locally
4. **AWS CLI** and **EB CLI** installed

## 🎯 Deployment Options

### Option 1: Automated Deployment (Recommended)
Uses GitHub Actions for automatic deployment on every push to main branch.

### Option 2: Manual Deployment
Uses the deployment script for one-time or testing deployments.

---

## 🤖 Option 1: Automated Deployment Setup

### Step 1: Configure AWS Credentials in GitHub

1. **Go to your GitHub repository**
2. **Navigate to**: Settings → Secrets and variables → Actions
3. **Add the following secrets**:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

### Step 2: Create AWS IAM User (if needed)

```bash
# Create IAM user with necessary permissions
aws iam create-user --user-name github-actions-fixfox
aws iam attach-user-policy --user-name github-actions-fixfox --policy-arn arn:aws:iam::aws:policy/AdministratorAccess-AWSElasticBeanstalk
aws iam create-access-key --user-name github-actions-fixfox
```

### Step 3: Push to Main Branch

```bash
git add .
git commit -m "Add deployment pipeline"
git push origin main
```

### Step 4: Monitor Deployment

1. **Go to GitHub Actions tab** in your repository
2. **Watch the deployment progress** in real-time
3. **Check logs** for any issues

### 🎉 GitHub Actions UI Features:

- ✅ **Real-time build logs**
- ✅ **Deployment status notifications**
- ✅ **Automatic rollback on failure**
- ✅ **Environment URL display**
- ✅ **Manual deployment trigger**

---

## 🛠️ Option 2: Manual Deployment

### Step 1: Configure AWS CLI

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your region: us-west-2
# Enter output format: json
```

### Step 2: Run Deployment Script

```bash
./scripts/deploy.sh
```

The script will:
- ✅ Check AWS configuration
- ✅ Install dependencies
- ✅ Build the application
- ✅ Create Elastic Beanstalk application
- ✅ Deploy to AWS
- ✅ Run health checks

---

## 🌐 Accessing Your Deployed API

After successful deployment, your API will be available at:
- **Main URL**: `http://fixfox-api-prod.eba-xxxxx.us-west-2.elasticbeanstalk.com`
- **Health Check**: `http://your-url/api/health`
- **API Endpoints**: `http://your-url/api/*`

## 📊 Monitoring & Management UIs

### 1. AWS Elastic Beanstalk Console
- **URL**: https://console.aws.amazon.com/elasticbeanstalk/
- **Features**:
  - Application health monitoring
  - Log viewing and downloading
  - Configuration management
  - Scaling settings
  - Environment variables

### 2. GitHub Actions Dashboard
- **URL**: https://github.com/idanaim/fixfox/actions
- **Features**:
  - Deployment history
  - Build logs
  - Manual deployment triggers
  - Status notifications

### 3. AWS CloudWatch (Advanced Monitoring)
- **URL**: https://console.aws.amazon.com/cloudwatch/
- **Features**:
  - Performance metrics
  - Custom alerts
  - Log aggregation
  - Error tracking

## 🔧 Configuration Management

### Environment Variables
Set in `.ebextensions/01-node-settings.config`:
```yaml
aws:elasticbeanstalk:application:environment:
  NODE_ENV: production
  PORT: 8080
  # Add your custom variables here
```

### Database Configuration
Your PostgreSQL RDS is already configured in `app.module.ts`:
- **Host**: fixfoxdb.cb8aywmkgppq.us-west-2.rds.amazonaws.com
- **Database**: fixfoxdb
- **SSL**: Enabled

## 🚨 Troubleshooting

### Common Issues:

1. **Deployment Fails**
   ```bash
   # Check logs
   eb logs
   # Or in GitHub Actions logs tab
   ```

2. **Health Check Fails**
   ```bash
   # Test health endpoint locally
   curl http://your-url/api/health
   ```

3. **Database Connection Issues**
   - Verify RDS security groups
   - Check database credentials
   - Ensure SSL configuration

### Useful Commands:

```bash
# Check application status
eb status

# View recent logs
eb logs

# SSH into instance (if needed)
eb ssh

# Redeploy current version
eb deploy

# Terminate environment (careful!)
eb terminate
```

## 🔄 Rollback Strategy

### Automatic Rollback:
- GitHub Actions automatically rolls back on deployment failure
- Previous version remains active until new deployment succeeds

### Manual Rollback:
```bash
# List application versions
eb appversion

# Deploy specific version
eb deploy --version-label=your-version-label
```

## 📈 Scaling Configuration

Your application is configured with:
- **Instance Type**: t3.micro (Free tier eligible)
- **Auto Scaling**: Disabled (single instance)
- **Load Balancer**: Application Load Balancer

To enable auto-scaling:
1. Go to EB Console → Configuration → Capacity
2. Set Min/Max instances
3. Configure scaling triggers

## 🔐 Security Best Practices

- ✅ HTTPS enabled (via Load Balancer)
- ✅ Database SSL connection
- ✅ Environment variables for secrets
- ✅ IAM roles with minimal permissions
- ✅ Security groups properly configured

## 📞 Support

If you encounter issues:
1. Check GitHub Actions logs
2. Review AWS EB console
3. Examine CloudWatch logs
4. Test health endpoint

---

**🎉 Congratulations! Your FixFox REST API is now deployed with a professional CI/CD pipeline!** 