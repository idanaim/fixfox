#!/bin/bash

set -e

# Configuration
REGION="us-west-2"
PROJECT_NAME="fixfox"
ENVIRONMENT=${1:-dev}  # dev or prod

echo "🚀 Setting up AWS ECS infrastructure for FixFox"
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo ""

# Validate environment
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
  echo "❌ Invalid environment. Use 'dev' or 'prod'"
  exit 1
fi

# Set environment-specific configurations
if [[ "$ENVIRONMENT" == "prod" ]]; then
  DESIRED_COUNT=2
  CPU=512
  MEMORY=1024
  MAX_CAPACITY=10
else
  DESIRED_COUNT=1
  CPU=256
  MEMORY=512
  MAX_CAPACITY=3
fi

CLUSTER_NAME="${PROJECT_NAME}-${ENVIRONMENT}"
SERVICE_NAME="${PROJECT_NAME}-api-${ENVIRONMENT}"
TASK_DEFINITION_NAME="${PROJECT_NAME}-api-${ENVIRONMENT}"
ECR_REPO_NAME="${PROJECT_NAME}-api"

echo "📦 Configuration:"
echo "  Cluster: $CLUSTER_NAME"
echo "  Service: $SERVICE_NAME"
echo "  Task Definition: $TASK_DEFINITION_NAME"
echo "  ECR Repository: $ECR_REPO_NAME"
echo "  CPU: $CPU"
echo "  Memory: $MEMORY MB"
echo "  Desired Count: $DESIRED_COUNT"
echo ""

# Check if AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
  echo "❌ AWS CLI is not installed"
  exit 1
fi

if ! aws sts get-caller-identity &> /dev/null; then
  echo "❌ AWS CLI is not configured or credentials are invalid"
  exit 1
fi

echo "✅ AWS CLI configured"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Account ID: $ACCOUNT_ID"
echo ""

# Create ECR repository
echo "🗂️ Creating ECR repository..."
aws ecr create-repository \
  --repository-name $ECR_REPO_NAME \
  --region $REGION \
  --image-scanning-configuration scanOnPush=true \
  2>/dev/null || echo "Repository already exists"

# Set lifecycle policy for ECR
echo "📋 Setting ECR lifecycle policy..."
cat > ecr-lifecycle-policy.json << EOF
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 5 images for $ENVIRONMENT",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 5
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
EOF

aws ecr put-lifecycle-policy \
  --repository-name $ECR_REPO_NAME \
  --lifecycle-policy-text file://ecr-lifecycle-policy.json \
  --region $REGION

rm -f ecr-lifecycle-policy.json

# Create ECS cluster
echo "🏗️ Creating ECS cluster..."
aws ecs create-cluster \
  --cluster-name $CLUSTER_NAME \
  --capacity-providers FARGATE \
  --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 \
  --region $REGION \
  2>/dev/null || echo "Cluster already exists"

# Create CloudWatch log group
echo "📊 Creating CloudWatch log group..."
aws logs create-log-group \
  --log-group-name "/ecs/${TASK_DEFINITION_NAME}" \
  --region $REGION \
  2>/dev/null || echo "Log group already exists"

# Create IAM role for task execution
echo "👤 Creating IAM roles..."

# Task Execution Role
cat > task-execution-role-trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

EXECUTION_ROLE_NAME="${PROJECT_NAME}-task-execution-role-${ENVIRONMENT}"
aws iam create-role \
  --role-name $EXECUTION_ROLE_NAME \
  --assume-role-policy-document file://task-execution-role-trust-policy.json \
  2>/dev/null || echo "Execution role already exists"

aws iam attach-role-policy \
  --role-name $EXECUTION_ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Task Role (for application permissions)
TASK_ROLE_NAME="${PROJECT_NAME}-task-role-${ENVIRONMENT}"
aws iam create-role \
  --role-name $TASK_ROLE_NAME \
  --assume-role-policy-document file://task-execution-role-trust-policy.json \
  2>/dev/null || echo "Task role already exists"

rm -f task-execution-role-trust-policy.json

# Create VPC and networking (simplified)
echo "🌐 Setting up networking..."

# Get default VPC
DEFAULT_VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=is-default,Values=true" \
  --query "Vpcs[0].VpcId" \
  --output text \
  --region $REGION)

if [[ "$DEFAULT_VPC_ID" == "None" ]]; then
  echo "❌ No default VPC found. Please create a VPC first."
  exit 1
fi

# Get subnets
SUBNET_IDS=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$DEFAULT_VPC_ID" \
  --query "Subnets[*].SubnetId" \
  --output text \
  --region $REGION)

# Create security group
SECURITY_GROUP_NAME="${PROJECT_NAME}-sg-${ENVIRONMENT}"
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
  --group-name $SECURITY_GROUP_NAME \
  --description "Security group for $PROJECT_NAME $ENVIRONMENT" \
  --vpc-id $DEFAULT_VPC_ID \
  --region $REGION \
  --query "GroupId" \
  --output text 2>/dev/null || \
  aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=$SECURITY_GROUP_NAME" \
    --query "SecurityGroups[0].GroupId" \
    --output text \
    --region $REGION)

# Allow HTTP traffic
aws ec2 authorize-security-group-ingress \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port 3000 \
  --cidr 0.0.0.0/0 \
  --region $REGION \
  2>/dev/null || echo "Security group rule already exists"

# Create Application Load Balancer
echo "⚖️ Creating Application Load Balancer..."
ALB_NAME="${PROJECT_NAME}-alb-${ENVIRONMENT}"

ALB_ARN=$(aws elbv2 create-load-balancer \
  --name $ALB_NAME \
  --subnets $SUBNET_IDS \
  --security-groups $SECURITY_GROUP_ID \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4 \
  --region $REGION \
  --query "LoadBalancers[0].LoadBalancerArn" \
  --output text 2>/dev/null || \
  aws elbv2 describe-load-balancers \
    --names $ALB_NAME \
    --query "LoadBalancers[0].LoadBalancerArn" \
    --output text \
    --region $REGION)

# Create target group
TARGET_GROUP_NAME="${PROJECT_NAME}-tg-${ENVIRONMENT}"
TARGET_GROUP_ARN=$(aws elbv2 create-target-group \
  --name $TARGET_GROUP_NAME \
  --protocol HTTP \
  --port 3000 \
  --vpc-id $DEFAULT_VPC_ID \
  --target-type ip \
  --health-check-path "/api/health" \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --region $REGION \
  --query "TargetGroups[0].TargetGroupArn" \
  --output text 2>/dev/null || \
  aws elbv2 describe-target-groups \
    --names $TARGET_GROUP_NAME \
    --query "TargetGroups[0].TargetGroupArn" \
    --output text \
    --region $REGION)

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TARGET_GROUP_ARN \
  --region $REGION \
  2>/dev/null || echo "Listener already exists"

# Register task definition
echo "📋 Creating task definition..."
cat > task-definition.json << EOF
{
  "family": "$TASK_DEFINITION_NAME",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "$CPU",
  "memory": "$MEMORY",
  "executionRoleArn": "arn:aws:iam::$ACCOUNT_ID:role/$EXECUTION_ROLE_NAME",
  "taskRoleArn": "arn:aws:iam::$ACCOUNT_ID:role/$TASK_ROLE_NAME",
  "containerDefinitions": [
    {
      "name": "$PROJECT_NAME-api",
      "image": "nginx:alpine",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/$TASK_DEFINITION_NAME",
          "awslogs-region": "$REGION",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "$ENVIRONMENT"
        },
        {
          "name": "PORT",
          "value": "3000"
        },
        {
          "name": "OPENAI_API_KEY",
          "value": "dummy-key-for-demo"
        }
      ]
    }
  ]
}
EOF

aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region $REGION

rm -f task-definition.json

# Create ECS service
echo "🎯 Creating ECS service..."
aws ecs create-service \
  --cluster $CLUSTER_NAME \
  --service-name $SERVICE_NAME \
  --task-definition $TASK_DEFINITION_NAME \
  --desired-count $DESIRED_COUNT \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_IDS],securityGroups=[$SECURITY_GROUP_ID],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$TARGET_GROUP_ARN,containerName=$PROJECT_NAME-api,containerPort=3000" \
  --region $REGION \
  2>/dev/null || echo "Service already exists or failed to create"

# Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns $ALB_ARN \
  --query "LoadBalancers[0].DNSName" \
  --output text \
  --region $REGION)

echo ""
echo "✅ AWS ECS infrastructure setup complete!"
echo ""
echo "📋 Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Cluster: $CLUSTER_NAME"
echo "  Service: $SERVICE_NAME"
echo "  ECR Repository: $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO_NAME"
echo "  Load Balancer: http://$ALB_DNS"
echo "  Health Check: http://$ALB_DNS/api/health"
echo ""
echo "🔧 Next steps:"
echo "1. Build and push your Docker image to ECR"
echo "2. Update the task definition with your image"
echo "3. Update the ECS service to deploy"
echo ""
echo "💡 Add these secrets to GitHub:"
echo "  AWS_ACCOUNT_ID: $ACCOUNT_ID"
echo "  AWS_ACCESS_KEY_ID: <your-access-key>"
echo "  AWS_SECRET_ACCESS_KEY: <your-secret-key>" 