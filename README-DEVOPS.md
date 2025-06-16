# FixFox DevOps Architecture

## 🏗️ Modern AWS Infrastructure

This project uses a modern, scalable AWS architecture with best practices for CI/CD, monitoring, and cost optimization.

### Architecture Overview

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   GitHub        │───▶│  GitHub      │───▶│   AWS ECR       │
│   Repository    │    │  Actions     │    │   Registry      │
└─────────────────┘    └──────────────┘    └─────────────────┘
                              │                       │
                              ▼                       ▼
                       ┌──────────────┐    ┌─────────────────┐
                       │  Nx Build    │    │   ECS Fargate   │
                       │  System      │    │   Service       │
                       └──────────────┘    └─────────────────┘
                                                     │
                                                     ▼
                                          ┌─────────────────┐
                                          │ Application     │
                                          │ Load Balancer   │
                                          └─────────────────┘
```

## 🚀 Key Features

- **AWS ECS Fargate**: Serverless containers with auto-scaling
- **Nx Monorepo**: Efficient builds with affected change detection
- **ECR**: Secure container registry with lifecycle policies
- **Application Load Balancer**: High availability and SSL termination
- **CloudWatch**: Comprehensive logging and monitoring
- **GitHub Actions**: Automated CI/CD pipeline

## 📦 Services Used

| Service | Purpose | Cost Optimization |
|---------|---------|-------------------|
| ECS Fargate | Container orchestration | Auto-scaling, spot instances |
| ECR | Container registry | Lifecycle policies |
| ALB | Load balancing | Shared across environments |
| CloudWatch | Logging & monitoring | Log retention policies |
| VPC | Networking | Default VPC for simplicity |

## 🛠️ Setup Instructions

### 1. Prerequisites

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
```

### 2. Infrastructure Setup

```bash
# Setup development environment
./scripts/setup-aws-ecs.sh dev

# Setup production environment
./scripts/setup-aws-ecs.sh prod
```

### 3. GitHub Secrets

Add these secrets to your GitHub repository:

```
AWS_ACCOUNT_ID: Your AWS account ID
AWS_ACCESS_KEY_ID: Your AWS access key
AWS_SECRET_ACCESS_KEY: Your AWS secret key
```

### 4. First Deployment

Push to your branch to trigger the first deployment:

```bash
git push origin dev     # Deploy to development
git push origin main    # Deploy to production
```

## 🔄 CI/CD Pipeline

### Workflow Triggers

- **Push to `dev`**: Deploys to development environment
- **Push to `main`**: Deploys to production environment
- **Manual trigger**: Deploy to any environment via GitHub UI

### Pipeline Stages

1. **Test & Lint**: Run affected tests and linting in parallel
2. **Build**: Build Docker image only if server code changed
3. **Deploy**: Push to ECR and update ECS service
4. **Health Check**: Verify deployment success

### Nx Optimization

- ✅ **Affected builds**: Only builds what changed
- ✅ **Parallel execution**: Tests and lints run in parallel
- ✅ **Caching**: Build artifacts cached between runs
- ✅ **Smart rebuilds**: Skip builds when no changes detected

## 🌍 Environments

### Development (`dev`)
- **URL**: `http://fixfox-alb-dev-*.us-west-2.elb.amazonaws.com`
- **Resources**: 256 CPU, 512MB RAM, 1 instance
- **Scaling**: 1-3 instances
- **Cost**: ~$15-30/month

### Production (`prod`)
- **URL**: `http://fixfox-alb-prod-*.us-west-2.elb.amazonaws.com`
- **Resources**: 512 CPU, 1024MB RAM, 2 instances
- **Scaling**: 1-10 instances
- **Cost**: ~$30-100/month

## 📊 Monitoring & Logs

### CloudWatch Dashboards

Access logs and metrics:

```bash
aws logs describe-log-groups --log-group-name-prefix "/ecs/fixfox-api"
```

### Health Checks

- **Endpoint**: `/api/health`
- **Interval**: 30 seconds
- **Timeout**: 5 seconds
- **Healthy threshold**: 2 consecutive successes

## 🔧 Common Operations

### View Service Status

```bash
aws ecs describe-services \
  --cluster fixfox-dev \
  --services fixfox-api-dev \
  --region us-west-2
```

### View Logs

```bash
aws logs tail /ecs/fixfox-api-dev --follow --region us-west-2
```

### Scale Service

```bash
aws ecs update-service \
  --cluster fixfox-dev \
  --service fixfox-api-dev \
  --desired-count 3 \
  --region us-west-2
```

### Force New Deployment

```bash
aws ecs update-service \
  --cluster fixfox-dev \
  --service fixfox-api-dev \
  --force-new-deployment \
  --region us-west-2
```

## 🏷️ Environment Variables

Set environment variables in the task definition:

```bash
# Edit task definition and update service
aws ecs describe-task-definition \
  --task-definition fixfox-api-dev \
  --region us-west-2 > task-def.json

# Edit task-def.json to add environment variables
# Then register the new version and update service
```

## 💰 Cost Optimization

### Development Environment
- Uses smaller instances (256 CPU, 512MB RAM)
- Single instance unless under load
- Shorter log retention (1 week)
- Single NAT gateway

### Production Environment
- Right-sized instances (512 CPU, 1024MB RAM)
- Auto-scaling based on CPU/memory utilization
- Longer log retention (1 month)
- Multiple AZ deployment for high availability

### General Optimizations
- ECR lifecycle policies to clean up old images
- CloudWatch log retention policies
- Fargate Spot instances for non-critical workloads
- Load balancer shared across environments

## 🚨 Troubleshooting

### Service Won't Start

1. Check CloudWatch logs:
   ```bash
   aws logs tail /ecs/fixfox-api-dev --follow --region us-west-2
   ```

2. Check task definition:
   ```bash
   aws ecs describe-task-definition --task-definition fixfox-api-dev --region us-west-2
   ```

### Deployment Fails

1. Check service events:
   ```bash
   aws ecs describe-services \
     --cluster fixfox-dev \
     --services fixfox-api-dev \
     --region us-west-2 \
     --query 'services[0].events'
   ```

2. Check GitHub Actions logs in the repository

### Health Check Fails

1. Verify your application exposes `/api/health` endpoint
2. Ensure the endpoint returns HTTP 200
3. Check security group allows traffic on port 3000

## 🔒 Security Best Practices

- ✅ ECR vulnerability scanning enabled
- ✅ IAM roles with least privilege access
- ✅ VPC with private subnets for containers
- ✅ Security groups with minimal required ports
- ✅ Secrets managed via AWS Systems Manager (recommended)

## 📈 Next Steps

1. **Domain Setup**: Add Route 53 domain and SSL certificate
2. **Database**: Add RDS or DynamoDB integration
3. **Secrets**: Migrate environment variables to AWS Secrets Manager
4. **Monitoring**: Add CloudWatch alarms and SNS notifications
5. **Blue/Green Deployments**: Implement zero-downtime deployments
6. **CDN**: Add CloudFront for static assets 