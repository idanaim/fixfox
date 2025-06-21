#!/bin/bash

set -e

# Manual deployment script for FixFox API
REGION="us-west-2"
PROJECT_NAME="fixfox"
ENVIRONMENT=${1:-prod}  # Default to prod, can pass "dev" as argument

echo "🚀 Manual deployment of FixFox API"
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo ""

# Validate environment
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
  echo "❌ Invalid environment. Use 'dev' or 'prod'"
  echo "Usage: ./scripts/manual-deploy.sh [dev|prod]"
  exit 1
fi

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker first."
  exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity >/dev/null 2>&1; then
  echo "❌ AWS CLI is not configured or credentials are invalid"
  echo "Run: aws configure"
  exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo "❌ jq is not installed. Installing via Homebrew..."
  brew install jq
fi

echo "✅ All prerequisites met"
echo ""

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account ID: $ACCOUNT_ID"

# Set up variables
CLUSTER_NAME="${PROJECT_NAME}-${ENVIRONMENT}"
SERVICE_NAME="${PROJECT_NAME}-api-${ENVIRONMENT}"
TASK_DEFINITION_NAME="${PROJECT_NAME}-api-${ENVIRONMENT}"
ECR_REPO_NAME="${PROJECT_NAME}-api"
ECR_REPO_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO_NAME"
IMAGE_TAG="${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S)"
IMAGE_URI="$ECR_REPO_URI:$IMAGE_TAG"

echo "📦 Deployment configuration:"
echo "  Cluster: $CLUSTER_NAME"
echo "  Service: $SERVICE_NAME"
echo "  Task Definition: $TASK_DEFINITION_NAME"
echo "  ECR Repository: $ECR_REPO_URI"
echo "  Image Tag: $IMAGE_TAG"
echo ""

# Step 1: Build Docker image
echo "🔨 Step 1: Building Docker image..."
echo "Building: $IMAGE_URI"

docker build -t "$IMAGE_URI" . --platform linux/amd64

if [ $? -eq 0 ]; then
  echo "✅ Docker image built successfully"
else
  echo "❌ Docker build failed"
  exit 1
fi
echo ""

# Step 2: Login to ECR
echo "🔐 Step 2: Logging into Amazon ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REPO_URI

if [ $? -eq 0 ]; then
  echo "✅ ECR login successful"
else
  echo "❌ ECR login failed"
  exit 1
fi
echo ""

# Step 3: Create ECR repository if it doesn't exist
echo "🗂️ Step 3: Ensuring ECR repository exists..."
aws ecr describe-repositories --repository-names $ECR_REPO_NAME --region $REGION >/dev/null 2>&1 || {
  echo "Creating ECR repository..."
  aws ecr create-repository --repository-name $ECR_REPO_NAME --region $REGION
}
echo "✅ ECR repository ready"
echo ""

# Step 4: Push image to ECR
echo "📤 Step 4: Pushing image to ECR..."
docker push "$IMAGE_URI"

if [ $? -eq 0 ]; then
  echo "✅ Image pushed successfully to ECR"
else
  echo "❌ Image push failed"
  exit 1
fi
echo ""

# Step 5: Update task definition
echo "📋 Step 5: Updating ECS task definition..."

# Get current task definition
echo "Getting current task definition..."
TASK_DEFINITION_JSON=$(aws ecs describe-task-definition \
  --task-definition $TASK_DEFINITION_NAME \
  --region $REGION \
  --query 'taskDefinition' \
  --output json)

if [ $? -ne 0 ]; then
  echo "❌ Failed to get current task definition"
  exit 1
fi

# Update image URI in task definition and remove unwanted fields
echo "Updating task definition with new image..."
NEW_TASK_DEFINITION=$(echo $TASK_DEFINITION_JSON | jq --arg IMAGE "$IMAGE_URI" '
  .containerDefinitions[0].image = $IMAGE |
  .containerDefinitions[0].command = null |
  del(.taskDefinitionArn) |
  del(.revision) |
  del(.status) |
  del(.requiresAttributes) |
  del(.placementConstraints) |
  del(.compatibilities) |
  del(.registeredAt) |
  del(.registeredBy)')

# Save to temp file and register
echo "$NEW_TASK_DEFINITION" > /tmp/task-definition.json

aws ecs register-task-definition \
  --cli-input-json file:///tmp/task-definition.json \
  --region $REGION >/dev/null

if [ $? -eq 0 ]; then
  echo "✅ New task definition registered"
else
  echo "❌ Failed to register task definition"
  exit 1
fi

# Clean up temp file
rm -f /tmp/task-definition.json
echo ""

# Step 6: Update ECS service
echo "🚀 Step 6: Updating ECS service..."
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --task-definition $TASK_DEFINITION_NAME \
  --region $REGION >/dev/null

if [ $? -eq 0 ]; then
  echo "✅ ECS service update initiated"
else
  echo "❌ Failed to update ECS service"
  exit 1
fi
echo ""

# Step 7: Wait for deployment
echo "⏳ Step 7: Waiting for deployment to complete..."
echo "This typically takes 3-5 minutes..."

aws ecs wait services-stable \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION

if [ $? -eq 0 ]; then
  echo "✅ Deployment completed successfully!"
else
  echo "⚠️ Deployment may still be in progress or failed"
  echo "Check the ECS console for details"
fi
echo ""

# Step 8: Get service information and test
echo "📊 Step 8: Getting service information..."

# Get load balancer URL
ALB_ARN=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION \
  --query 'services[0].loadBalancers[0].targetGroupArn' \
  --output text)

if [ "$ALB_ARN" != "None" ] && [ -n "$ALB_ARN" ]; then
  # Extract target group name from ARN
  TG_NAME=$(echo $ALB_ARN | cut -d'/' -f2)
  
  # Get load balancer ARN from target group
  LB_ARN=$(aws elbv2 describe-target-groups \
    --target-group-arns $ALB_ARN \
    --region $REGION \
    --query 'TargetGroups[0].LoadBalancerArns[0]' \
    --output text)
  
  if [ "$LB_ARN" != "None" ] && [ -n "$LB_ARN" ]; then
    # Get load balancer DNS name
    LB_DNS=$(aws elbv2 describe-load-balancers \
      --load-balancer-arns $LB_ARN \
      --region $REGION \
      --query 'LoadBalancers[0].DNSName' \
      --output text)
    
    if [ -n "$LB_DNS" ]; then
      SERVICE_URL="http://$LB_DNS"
      HEALTH_URL="$SERVICE_URL/api/health"
      
      echo "🌐 Service URL: $SERVICE_URL"
      echo "🏥 Health Check URL: $HEALTH_URL"
      echo ""
      
      # Perform health check
      echo "🏥 Performing health check..."
      sleep 30  # Give the service a moment to start
      
      for i in {1..10}; do
        echo "Health check attempt $i/10..."
        if curl -f -s "$HEALTH_URL" >/dev/null 2>&1; then
          echo "✅ Health check passed!"
          echo ""
          echo "🎉 Deployment successful!"
          echo "Your API is now live at: $SERVICE_URL"
          echo "Health endpoint: $HEALTH_URL"
          
          # Show health response
          echo ""
          echo "📊 Health response:"
          curl -s "$HEALTH_URL" | jq . 2>/dev/null || curl -s "$HEALTH_URL"
          break
        else
          echo "⏳ Health check failed, retrying in 30 seconds..."
          sleep 30
        fi
        
        if [ $i -eq 10 ]; then
          echo "⚠️ Health check failed after 10 attempts"
          echo "The service may still be starting up. Check manually:"
          echo "curl $HEALTH_URL"
        fi
      done
    fi
  fi
fi

echo ""
echo "🔧 Useful commands for monitoring:"
echo "# Check service status:"
echo "aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $REGION"
echo ""
echo "# View logs:"
echo "aws logs tail /ecs/$TASK_DEFINITION_NAME --follow --region $REGION"
echo ""
echo "# Force new deployment:"
echo "aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --force-new-deployment --region $REGION"

echo ""
echo "🎯 Deployment Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Image: $IMAGE_URI"
echo "  Cluster: $CLUSTER_NAME"
echo "  Service: $SERVICE_NAME"
if [ -n "$SERVICE_URL" ]; then
  echo "  URL: $SERVICE_URL"
fi
echo ""
echo "✅ Manual deployment completed!" 