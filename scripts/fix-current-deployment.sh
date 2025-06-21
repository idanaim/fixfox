#!/bin/bash

set -e

# Immediate fix for current failing deployment
REGION="us-west-2"
PROJECT_NAME="fixfox"
ENVIRONMENT="prod"  # Change to "dev" if you're fixing dev environment
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

CLUSTER_NAME="${PROJECT_NAME}-${ENVIRONMENT}"
SERVICE_NAME="${PROJECT_NAME}-api-${ENVIRONMENT}"
TASK_DEFINITION_NAME="${PROJECT_NAME}-api-${ENVIRONMENT}"

echo "🚨 Emergency fix for failing ECS deployment"
echo "Environment: $ENVIRONMENT"
echo "Cluster: $CLUSTER_NAME"
echo "Service: $SERVICE_NAME"
echo ""

# Check if there's a built image in ECR
ECR_REPO_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/fixfox-api"
echo "🔍 Checking for existing images in ECR..."

# Get the latest image
LATEST_IMAGE=$(aws ecr describe-images \
  --repository-name fixfox-api \
  --region $REGION \
  --query 'sort_by(imageDetails,&imagePushedAt)[-1].imageTags[0]' \
  --output text 2>/dev/null || echo "none")

if [ "$LATEST_IMAGE" = "none" ] || [ "$LATEST_IMAGE" = "null" ]; then
  echo "❌ No Docker images found in ECR. You need to build and push first:"
  echo "1. Run: docker build -t $ECR_REPO_URI:latest ."
  echo "2. Run: aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REPO_URI"
  echo "3. Run: docker push $ECR_REPO_URI:latest"
  echo "4. Then run this script again"
  exit 1
fi

IMAGE_URI="$ECR_REPO_URI:$LATEST_IMAGE"
echo "✅ Found image: $IMAGE_URI"

# Get current task definition
echo "📋 Getting current task definition..."
TASK_DEFINITION=$(aws ecs describe-task-definition \
  --task-definition $TASK_DEFINITION_NAME \
  --region $REGION \
  --query 'taskDefinition' \
  --output json)

# Update image URI in task definition
echo "🔄 Updating task definition with correct image..."
NEW_TASK_DEFINITION=$(echo $TASK_DEFINITION | jq --arg IMAGE "$IMAGE_URI" \
  '.containerDefinitions[0].image = $IMAGE | 
   .containerDefinitions[0].command = null | 
   del(.taskDefinitionArn) | del(.revision) | del(.status) | del(.requiresAttributes) | del(.placementConstraints) | del(.compatibilities) | del(.registeredAt) | del(.registeredBy)')

# Register new task definition
echo "📝 Registering new task definition..."
aws ecs register-task-definition \
  --cli-input-json "$NEW_TASK_DEFINITION" \
  --region $REGION

# Update service to use new task definition
echo "🚀 Updating ECS service..."
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --task-definition $TASK_DEFINITION_NAME \
  --region $REGION

echo "✅ Service update initiated"
echo ""
echo "⏳ Waiting for service to stabilize (this may take 5-10 minutes)..."
aws ecs wait services-stable \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION

echo "🎉 Deployment fixed! Your service should now be running properly."
echo ""
echo "🔍 Check the status:"
echo "aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $REGION" 