# Migration Guide: App Runner → ECS Fargate

## 🚀 Overview

This guide helps you migrate from the previous App Runner setup to the new AWS ECS Fargate architecture.

## ⚠️ Important Changes

### What's Different
- **Platform**: App Runner → ECS Fargate
- **Build System**: Optimized Nx builds with affected change detection
- **Infrastructure**: Infrastructure as Code with automated setup
- **Cost**: Better cost optimization with auto-scaling

### What's Removed
- ❌ App Runner services and configurations
- ❌ Elastic Beanstalk setup (was unused)
- ❌ Multiple deployment scripts
- ❌ Manual infrastructure setup

### What's New
- ✅ Modern GitHub Actions workflow with Nx optimization
- ✅ AWS ECS Fargate with auto-scaling
- ✅ ECR container registry with lifecycle policies
- ✅ Application Load Balancer with health checks
- ✅ Comprehensive monitoring and logging

## 🔄 Migration Steps

### Step 1: Cleanup Old Resources (Optional)

If you have existing App Runner services, you can remove them:

```bash
# List existing App Runner services
aws apprunner list-services --region us-west-2

# Delete old services (replace with your actual ARN)
aws apprunner delete-service \
  --service-arn "arn:aws:apprunner:us-west-2:ACCOUNT:service/SERVICE_NAME/SERVICE_ID" \
  --region us-west-2
```

### Step 2: Setup New Infrastructure

```bash
# Setup development environment
./scripts/setup-aws-ecs.sh dev

# Setup production environment  
./scripts/setup-aws-ecs.sh prod
```

### Step 3: Update GitHub Secrets

Ensure these secrets are set in your GitHub repository:

```
AWS_ACCOUNT_ID: Your AWS account ID (get from setup script output)
AWS_ACCESS_KEY_ID: Your AWS access key
AWS_SECRET_ACCESS_KEY: Your AWS secret key
```

### Step 4: Test Deployment

Push a change to trigger the new workflow:

```bash
# Make a small change and push
git add .
git commit -m "test: trigger new deployment workflow"
git push origin dev
```

## 📊 Comparison: Before vs After

| Aspect | App Runner (Before) | ECS Fargate (After) |
|--------|-------------------|-------------------|
| **Cost** | $25-50/month | $15-30/month (dev), $30-100/month (prod) |
| **Scaling** | Limited control | Full auto-scaling control |
| **Monitoring** | Basic | CloudWatch + ALB metrics |
| **Networking** | Limited VPC control | Full VPC control |
| **Deployment** | Git-based only | Docker-based with CI/CD |
| **Build Optimization** | None | Nx affected builds |
| **Multi-environment** | Manual setup | Automated with IaC |

## 🏗️ New Architecture Benefits

### Performance
- **Faster builds**: Only builds affected code changes
- **Parallel execution**: Tests and lints run simultaneously
- **Smart caching**: Nx caches build artifacts

### Cost Optimization
- **Right-sizing**: Different instance sizes per environment
- **Auto-scaling**: Scales down when not in use
- **Lifecycle policies**: Automatic cleanup of old images

### Reliability
- **Load balancer**: High availability across AZs
- **Health checks**: Automatic unhealthy instance replacement  
- **Blue-green deployments**: Zero-downtime deployments

### Monitoring
- **CloudWatch logs**: Centralized logging
- **Metrics**: CPU, memory, request metrics
- **Alarms**: Automated alerting (can be added)

## 🔧 New Workflow Features

### Intelligent Builds
```yaml
# Only builds if server code changed
- name: Check if server changed
  id: changes
  run: |
    if npx nx affected --target=build --plain | grep -q "rest-man-server"; then
      echo "changed=true" >> $GITHUB_OUTPUT
    else
      echo "changed=false" >> $GITHUB_OUTPUT
    fi
```

### Parallel Testing
```yaml
# Tests and linting run in parallel
- name: Run affected tests
  run: npx nx affected --target=test --parallel=3

- name: Run affected lint  
  run: npx nx affected --target=lint --parallel=3
```

### Environment Detection
```yaml
# Automatically detects environment from branch
if [ "${{ github.ref }}" = "refs/heads/main" ]; then
  ENV="prod"
else
  ENV="dev"
fi
```

## 🚨 Troubleshooting Migration

### Build Issues
If builds fail, check:
1. Nx configuration: `nx.json` has proper task runner setup
2. Dependencies: `npm ci` completes successfully
3. Docker build: Local Docker build works

### Deployment Issues
If deployment fails, check:
1. AWS credentials are valid
2. ECS infrastructure was created successfully
3. ECR repository exists and is accessible
4. Task definition is valid

### Service Issues
If service won't start, check:
1. CloudWatch logs: `/ecs/fixfox-api-{env}`
2. Health check endpoint: `/api/health` returns 200
3. Security groups allow traffic on port 3000

## 📞 Getting Help

### View Logs
```bash
# View ECS service logs
aws logs tail /ecs/fixfox-api-dev --follow --region us-west-2

# View service status
aws ecs describe-services \
  --cluster fixfox-dev \
  --services fixfox-api-dev \
  --region us-west-2
```

### Common Commands
```bash
# Force new deployment
aws ecs update-service \
  --cluster fixfox-dev \
  --service fixfox-api-dev \
  --force-new-deployment \
  --region us-west-2

# Scale service
aws ecs update-service \
  --cluster fixfox-dev \
  --service fixfox-api-dev \
  --desired-count 2 \
  --region us-west-2
```

## ✅ Migration Checklist

- [ ] Old App Runner services cleaned up (optional)
- [ ] New ECS infrastructure created (`./scripts/setup-aws-ecs.sh`)
- [ ] GitHub secrets updated
- [ ] First deployment tested and successful
- [ ] Health checks passing
- [ ] Monitoring setup verified
- [ ] Team notified of new workflow

## 🎉 Welcome to Modern DevOps!

Your new setup provides:
- **Better performance** with Nx optimizations
- **Lower costs** with right-sized infrastructure  
- **Higher reliability** with load balancing and auto-scaling
- **Better monitoring** with comprehensive logging
- **Easier management** with Infrastructure as Code

For detailed operations guide, see [README-DEVOPS.md](./README-DEVOPS.md). 